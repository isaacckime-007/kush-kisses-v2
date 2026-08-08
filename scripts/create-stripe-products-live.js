// scripts/create-stripe-products-live.js
//
// LIVE-MODE version of the product-creation script. Creates a Stripe
// Product + Price for each variant in lib/products.js, using
// STRIPE_SECRET_KEY_LIVE instead of STRIPE_SECRET_KEY.
//
// IMPORTANT: this does NOT touch lib/products.js. It writes results to
// scripts/stripe-price-map-live.json only. We do this deliberately so
// your working test-mode lib/products.js stays intact until you're
// ready to review the live IDs and cut over on purpose.
//
// Usage:
//   node scripts/create-stripe-products-live.js
//
// After running, review scripts/stripe-price-map-live.json, then we'll
// do a separate, explicit patch step to update lib/products.js with the
// live IDs when you're ready to actually go live.

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

if (!process.env.STRIPE_SECRET_KEY_LIVE) {
  console.error("❌ STRIPE_SECRET_KEY_LIVE not found in .env.local.");
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY_LIVE.includes("_live_")) {
  console.error("❌ STRIPE_SECRET_KEY_LIVE does not look like a live-mode key (expected rk_live_... or sk_live_...). Aborting.");
  process.exit(1);
}

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE);

const productsPath = path.join(__dirname, "..", "lib", "products.js");
const products = require(productsPath);

async function main() {
  console.log("🔴 LIVE MODE — this will create real products in Stripe's live account.\n");

  const results = [];
  const skipped = [];

  for (const product of products) {
    if (product.needsReview) {
      skipped.push(product.name);
      console.log(`⚠️  SKIPPING "${product.name}" (id: ${product.id}) — flagged needsReview.`);
      continue;
    }

    const stripeProduct = await stripe.products.create({
      name: product.name,
      metadata: { vorne_product_id: product.id },
    });

    for (const variant of product.variants) {
      const priceLabel = variant.label ? `${product.name} (${variant.label})` : product.name;

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(variant.price * 100),
        currency: "usd",
        nickname: priceLabel,
      });

      console.log(`✅ ${priceLabel} → ${stripePrice.id}`);

      results.push({
        productId: product.id,
        variantId: variant.id,
        shopifyVariantId: variant.shopifyVariantId,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });
    }
  }

  const mapPath = path.join(__dirname, "stripe-price-map-live.json");
  fs.writeFileSync(mapPath, JSON.stringify(results, null, 2));

  console.log(`\nDone. ${results.length} LIVE prices created.`);
  console.log(`Saved to scripts/stripe-price-map-live.json — lib/products.js was NOT modified.`);
  if (skipped.length) {
    console.log(`\n⚠️  Skipped (needs review with KK): ${skipped.join(", ")}`);
  }
  console.log("\nNext: review scripts/stripe-price-map-live.json, then we'll patch lib/products.js deliberately when ready to cut over.");
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message);
  console.error("No file was written past the failure point.");
  process.exit(1);
});
