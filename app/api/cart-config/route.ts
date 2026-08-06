// app/api/cart-config/route.ts
//
// Returns whether the Stripe cart system is currently enabled.
// Controlled by the CART_ENABLED env var in Vercel — set to "false"
// to disable the cart and revert the site to Shopify-only checkout
// without any code changes or redeploy of the site itself (just
// change the env var and redeploy).

import { NextResponse } from 'next/server';

export async function GET() {
  const enabled = process.env.CART_ENABLED !== 'false';
  return NextResponse.json({ enabled });
}
