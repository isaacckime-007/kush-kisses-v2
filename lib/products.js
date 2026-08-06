// Kush Kisses product catalog — pulled from Shopify Admin API on Aug 5/6, 2026.
// stripePriceId fields are null until Stripe products are created.
// Each product has one or more variants (most have a single "Default" variant;
// Kush Kisses Set has 5 size variants).
//
// FLAGGED FOR REVIEW: two separate "Clear" products exist in Shopify with
// different prices/stock (handles "clear" $15.00 and "clear-1" $7.50).
// Confirm with KK which is correct before creating in Stripe — both are
// included below as separate entries for now.

const products = [
  {
    id: "baby-brown",
    name: "BABY BROWN",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133366788459", stripePriceId: null },
    ],
  },
  {
    id: "baby-peach",
    name: "BABY PEACH",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133515653483", stripePriceId: null },
    ],
  },
  {
    id: "baby-pink",
    name: "BABY PINK",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133616841067", stripePriceId: null },
    ],
  },
  {
    id: "brown",
    name: "BROWN",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133627425131", stripePriceId: null },
    ],
  },
  {
    id: "bubble-gum",
    name: "BUBBLE GUM",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194326704491", stripePriceId: null },
    ],
  },
  {
    id: "chocolate",
    name: "CHOCOLATE",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194353672555", stripePriceId: null },
    ],
  },
  {
    id: "chocolate-cookie",
    name: "CHOCOLATE COOKIE",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194365600107", stripePriceId: null },
    ],
  },
  {
    id: "clear",
    name: "CLEAR",
    needsReview: true,
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133640958315", stripePriceId: null },
    ],
  },
  {
    id: "clear-2",
    name: "CLEAR (DUPLICATE — CONFIRM WITH KK)",
    needsReview: true,
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194340303211", stripePriceId: null },
    ],
  },
  {
    id: "coconut",
    name: "COCONUT",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194345185643", stripePriceId: null },
    ],
  },
  {
    id: "compact-mirror",
    name: "KUSH KISSES COMPACT MIRROR",
    outOfStock: true,
    variants: [
      { id: "default", label: null, price: 6.99, shopifyVariantId: "53133657440619", stripePriceId: null },
    ],
  },
  {
    id: "hand-held-mirror",
    name: "KUSH KISSES HAND HELD MIRROR",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133696598379", stripePriceId: null },
    ],
  },
  {
    id: "kush-kisses-set",
    name: "KUSH KISSES SET",
    variants: [
      { id: "xs", label: "XS", price: 75.00, shopifyVariantId: "53213477405035", stripePriceId: null },
      { id: "s", label: "S", price: 75.00, shopifyVariantId: "53213477437803", stripePriceId: null },
      { id: "m", label: "M", price: 75.00, shopifyVariantId: "53213477470571", stripePriceId: null },
      { id: "l", label: "L", price: 75.00, shopifyVariantId: "53213477503339", stripePriceId: null },
      { id: "xl", label: "XL", price: 75.00, shopifyVariantId: "53213477536107", stripePriceId: null },
    ],
  },
  {
    id: "latte",
    name: "LATTE",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194322575723", stripePriceId: null },
    ],
  },
  {
    id: "mercury",
    name: "MERCURY",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194338042219", stripePriceId: null },
    ],
  },
  {
    id: "red-sorceress",
    name: "RED SORCERESS",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194320216427", stripePriceId: null },
    ],
  },
  {
    id: "sheer-pink",
    name: "SHEER PINK",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133649183083", stripePriceId: null },
    ],
  },
];

module.exports = products;
