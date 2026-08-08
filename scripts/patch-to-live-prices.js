// scripts/patch-to-live-prices.js
//
// Reads scripts/stripe-price-map-live.json and replaces the CURRENT
// stripePriceId values in lib/products.js (currently test-mode price_...
// ids) with the LIVE-mode price_... ids, matched by shopifyVariantId.
//
// This is the deliberate cutover step. lib/products.js after this run
// will point at LIVE Stripe prices — only run this when you're actually
// ready to go live.
//
// Usage:
//   node scripts/patch-to-live-prices.js

const fs = require("fs");
const path = require("path");

const productsPath = path.join(__dirname, "..", "lib", "products.js");
const mapPath = path.join(__dirname, "stripe-price-map-live.json");

const liveMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
let fileContent = fs.readFileSync(productsPath, "utf8");

let patchedCount = 0;

for (const entry of liveMap) {
  // Find the current stripePriceId for this shopifyVariantId, whatever it is
  // right now (test-mode price_... value), and replace it with the live one.
  const regex = new RegExp(
    `(shopifyVariantId: "${entry.shopifyVariantId}", stripePriceId: )"price_[^"]+"`
  );

  const match = fileContent.match(regex);
  if (!match) {
    throw new Error(
      `Could not find a stripePriceId line for shopifyVariantId ${entry.shopifyVariantId}. Aborting before writing — no changes saved.`
    );
  }

  fileContent = fileContent.replace(regex, `$1"${entry.stripePriceId}"`);
  patchedCount++;
}

if (patchedCount !== liveMap.length) {
  throw new Error(`Expected to patch ${liveMap.length} entries, only patched ${patchedCount}. Aborting write.`);
}

fs.writeFileSync(productsPath, fileContent, "utf8");

console.log(`✅ Patched ${patchedCount} price IDs in lib/products.js to LIVE mode.`);
console.log("Next: npm run build && npx tsc --noEmit, then review git diff lib/products.js before committing.");
