// app/api/create-checkout-session/route.ts
//
// Creates a Stripe Checkout Session from the cart contents sent by the client.
// Requires STRIPE_SECRET_KEY env var. Requires products.stripePriceId to be
// populated (see lib/products.js) — until then this will return a clear
// error rather than silently failing.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import products from '@/lib/products';
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-07-29.dahlia',
  });
}


interface CartItem {
  [key: string]: number; // productId or productId:variantId -> quantity
}

function findVariant(cartKey: string) {
  // cartKey format: "productId" (default variant) or "productId:variantId"
  const [productId, variantId] = cartKey.split(':');
  const product = products.find((p: any) => p.id === productId);
  if (!product) return null;

  const variant = variantId
    ? product.variants.find((v: any) => v.id === variantId)
    : product.variants[0];

  if (!variant) return null;

  return { product, variant };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured yet. STRIPE_SECRET_KEY is missing.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const cart: CartItem = body.cart;

    if (!cart || Object.keys(cart).length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const missingPriceIds: string[] = [];

    for (const [cartKey, quantity] of Object.entries(cart)) {
      const found = findVariant(cartKey);
      if (!found) {
        return NextResponse.json(
          { error: `Unknown product in cart: ${cartKey}` },
          { status: 400 }
        );
      }

      const { product, variant } = found;

      if (!variant.stripePriceId) {
        missingPriceIds.push(`${product.name}${variant.label ? ' - ' + variant.label : ''}`);
        continue;
      }

      line_items.push({
        price: variant.stripePriceId,
        quantity: quantity as number,
      });
    }

    if (missingPriceIds.length > 0) {
      return NextResponse.json(
        {
          error: 'Some items in your cart are not yet available for checkout.',
          missing: missingPriceIds,
        },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'https://kush-kisses.com';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      success_url: `${origin}/index.html?checkout=success`,
      cancel_url: `${origin}/index.html?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout session creation error:', err);
    return NextResponse.json(
      { error: 'Something went wrong creating your checkout session.' },
      { status: 500 }
    );
  }
}
