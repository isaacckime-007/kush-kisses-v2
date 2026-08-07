// scripts/create-stripe-products.js
//
// Creates a Stripe Product + Price for each variant in lib/products.js,
// then patches stripePriceId values directly into that file (targeted
// text replacement anchored on the unique shopifyVariantId — same safe
// pattern as the Python patch scripts, with an assert check before writing).
//
// Products flagged `needsReview: true` (the two "Clear" listings) are
// SKIPPED automatically — resolve that with KK first, then re-run just
// for that product once it's fixed.
//
// Usage:
//   npm install stripe dotenv --save
//   vercel env pull .env.local        (pulls STRIPE_SECRET_KEY locally)
//   node scripts/create-stripe-products.js

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY not found. Run `vercel env pull .env.local` first, or add it to .env.local manually.");
  process.exit(1);
}

if (process.env.STRIPE_SECRET_KEY.includes("_live_")) {
  console.warn("⚠️  WARNING: this looks like a LIVE mode key (rk_live_... / sk_live_...).");
  console.warn("   Your plan calls for testing in Stripe TEST MODE first. Ctrl+C now if that's not intended.\n");
}

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const productsPath = path.join(__dirname, "..", "lib", "products.js");
const products = require(productsPath);

async function main() {
  let fileContent = fs.readFileSync(productsPath, "utf8");
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

      // Anchor on the unique shopifyVariantId so we only touch this exact line.
      const anchor = `shopifyVariantId: "${variant.shopifyVariantId}", stripePriceId: null`;
      const replacement = `shopifyVariantId: "${variant.shopifyVariantId}", stripePriceId: "${stripePrice.id}"`;

      const occurrences = fileContent.split(anchor).length - 1;
      if (occurrences !== 1) {
        throw new Error(
          `Expected exactly 1 match for shopifyVariantId ${variant.shopifyVariantId}, found ${occurrences}. ` +
          `Aborting before writing the file — no changes saved yet. Check lib/products.js for unexpected edits.`
        );
      }

      fileContent = fileContent.replace(anchor, replacement);

      results.push({
        productId: product.id,
        variantId: variant.id,
        shopifyVariantId: variant.shopifyVariantId,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });
    }
  }

  fs.writeFileSync(productsPath, fileContent, "utf8");

  const mapPath = path.join(__dirname, "stripe-price-map.json");
  fs.writeFileSync(mapPath, JSON.stringify(results, null, 2));

  console.log(`\nDone. ${results.length} prices created and written into lib/products.js.`);
  console.log(`Reference map saved to scripts/stripe-price-map.json.`);
  if (skipped.length) {
    console.log(`\n⚠️  Skipped (needs review with KK): ${skipped.join(", ")}`);
    console.log("   Once resolved, remove needsReview from that entry and re-run this script — it only touches products still set to stripePriceId: null.");
  }
  console.log("\nNext: run `npm run build && npx tsc --noEmit`, then reconcile cart.js / shop.html to match lib/products.js.");
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message);
  console.error("No further changes were written past the failure point.");
  process.exit(1);
});
