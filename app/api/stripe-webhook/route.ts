// app/api/stripe-webhook/route.ts
//
// Listens for Stripe checkout.session.completed events, creates a matching
// order in Shopify via Admin API, and sends a Resend failure alert to
// Isaac + the client if the Shopify sync fails for any reason.
//
// Requires env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SHOPIFY_CLIENT_ID
//   SHOPIFY_CLIENT_SECRET
//   SHOPIFY_STORE_DOMAIN
//   RESEND_API_KEY
//   ALERT_EMAIL_ISAAC (e.g. Isaacckime@gmail.com)
//   ALERT_EMAIL_CLIENT (KK's email)

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import products from '@/lib/products';
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-07-29.dahlia',
  });
}


export const maxDuration = 60;

// --- Shopify token cache (in-memory, per serverless instance) ---
let cachedShopifyToken: { token: string; expiresAt: number } | null = null;

async function getShopifyAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedShopifyToken && cachedShopifyToken.expiresAt > now) {
    return cachedShopifyToken.token;
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error('Missing Shopify credentials in environment variables.');
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Shopify access token: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedShopifyToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

function findVariantByStripePriceId(stripePriceId: string) {
  for (const product of products as any[]) {
    for (const variant of product.variants) {
      if (variant.stripePriceId === stripePriceId) {
        return { product, variant };
      }
    }
  }
  return null;
}

async function createShopifyOrder(session: Stripe.Checkout.Session, lineItems: Stripe.LineItem[]) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = await getShopifyAccessToken();

  const shopifyLineItems = [];
  const unmatched: string[] = [];

  for (const item of lineItems) {
    const priceId = item.price?.id;
    if (!priceId) continue;

    const found = findVariantByStripePriceId(priceId);
    if (!found) {
      unmatched.push(item.description || priceId);
      continue;
    }

    shopifyLineItems.push({
      variant_id: found.variant.shopifyVariantId,
      quantity: item.quantity,
    });
  }

  if (unmatched.length > 0) {
    throw new Error(`Could not match Stripe line items to Shopify variants: ${unmatched.join(', ')}`);
  }

  const shipping = (session as any).shipping_details || (session as any).shipping;
  const customerEmail = session.customer_details?.email || 'unknown@example.com';

  const orderPayload = {
    order: {
      line_items: shopifyLineItems,
      email: customerEmail,
      financial_status: 'paid',
      shipping_address: shipping?.address
        ? {
            first_name: shipping.name?.split(' ')[0] || '',
            last_name: shipping.name?.split(' ').slice(1).join(' ') || '',
            address1: shipping.address.line1,
            address2: shipping.address.line2 || '',
            city: shipping.address.city,
            province: shipping.address.state,
            zip: shipping.address.postal_code,
            country: shipping.address.country,
          }
        : undefined,
      tags: 'vorne-stripe-sync',
      note: `Synced from Stripe Checkout. Stripe session: ${session.id}`,
    },
  };

  const res = await fetch(`https://${domain}/admin/api/2026-07/orders.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify order creation failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function sendFailureAlert(session: Stripe.Checkout.Session, lineItems: Stripe.LineItem[], error: Error) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const isaacEmail = process.env.ALERT_EMAIL_ISAAC;
  const clientEmail = process.env.ALERT_EMAIL_CLIENT;

  if (!resendApiKey || !isaacEmail) {
    console.error('Cannot send failure alert — missing RESEND_API_KEY or ALERT_EMAIL_ISAAC.');
    return;
  }

  const itemsList = lineItems
    .map((item) => `- ${item.description} x${item.quantity} ($${((item.amount_total || 0) / 100).toFixed(2)})`)
    .join('\n');

  const customerEmail = session.customer_details?.email || 'unknown';
  const totalPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : 'unknown';

  const emailBody = `
A Stripe payment succeeded but the Shopify order sync FAILED. This order needs to be entered into Shopify manually.

Stripe Session ID: ${session.id}
Customer Email: ${customerEmail}
Total Paid: $${totalPaid}

Items:
${itemsList}

Error: ${error.message}

Please log into Shopify and create this order manually as soon as possible.
  `.trim();

  const recipients = [isaacEmail, clientEmail].filter(Boolean);

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'hello@vorne.digital',
        to: recipients,
        subject: `⚠️ Kush Kisses order sync failed — manual entry needed`,
        text: emailBody,
      }),
    });
  } catch (alertErr) {
    console.error('Failed to send Resend alert:', alertErr);
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature || '', webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    const lineItemsResponse = await getStripe().checkout.sessions.listLineItems(session.id, {
      expand: ['data.price'],
    });
    const lineItems = lineItemsResponse.data;

    await createShopifyOrder(session, lineItems);

    return NextResponse.json({ received: true, synced: true });
  } catch (err: any) {
    console.error('Shopify sync failed:', err.message);

    try {
      const lineItemsResponse = await getStripe().checkout.sessions.listLineItems(session.id, {
        expand: ['data.price'],
      });
      await sendFailureAlert(session, lineItemsResponse.data, err);
    } catch (alertErr) {
      console.error('Also failed to send failure alert:', alertErr);
    }

    return NextResponse.json({ received: true, synced: false, error: err.message });
  }
}
