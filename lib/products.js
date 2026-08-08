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
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133366788459", stripePriceId: "price_1U21JnLYqkehBQUR9h6PzuLY" },
    ],
  },
  {
    id: "baby-peach",
    name: "BABY PEACH",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133515653483", stripePriceId: "price_1U21JoLYqkehBQUR8XbGcWCy" },
    ],
  },
  {
    id: "baby-pink",
    name: "BABY PINK",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133616841067", stripePriceId: "price_1U21JoLYqkehBQURgwcdzIon" },
    ],
  },
  {
    id: "brown",
    name: "BROWN",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133627425131", stripePriceId: "price_1U21JoLYqkehBQURLrXaW0i6" },
    ],
  },
  {
    id: "bubble-gum",
    name: "BUBBLE GUM",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194326704491", stripePriceId: "price_1U21JoLYqkehBQUR8eUANXf6" },
    ],
  },
  {
    id: "chocolate",
    name: "CHOCOLATE",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194353672555", stripePriceId: "price_1U21JpLYqkehBQURt44svxSH" },
    ],
  },
  {
    id: "chocolate-cookie",
    name: "CHOCOLATE COOKIE",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194365600107", stripePriceId: "price_1U21JpLYqkehBQURhi8oNsZl" },
    ],
  },
  {
    id: "clear",
    name: "CLEAR",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133640958315", stripePriceId: "price_1U21JpLYqkehBQUR1ozuZ4pN" },
    ],
  },
  {
    id: "clear-2",
    name: "CLEAR MINI",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194340303211", stripePriceId: "price_1U21JqLYqkehBQURlNDNu4Vp" },
    ],
  },
  {
    id: "coconut",
    name: "COCONUT",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194345185643", stripePriceId: "price_1U21JqLYqkehBQURMiquQYvV" },
    ],
  },
  {
    id: "compact-mirror",
    name: "KUSH KISSES COMPACT MIRROR",
    outOfStock: true,
    variants: [
      { id: "default", label: null, price: 6.99, shopifyVariantId: "53133657440619", stripePriceId: "price_1U21JqLYqkehBQURk3cN9lxa" },
    ],
  },
  {
    id: "hand-held-mirror",
    name: "KUSH KISSES HAND HELD MIRROR",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133696598379", stripePriceId: "price_1U21JqLYqkehBQURwrGNs9wf" },
    ],
  },
  {
    id: "kush-kisses-set",
    name: "KUSH KISSES SET",
    variants: [
      { id: "xs", label: "XS", price: 75.00, shopifyVariantId: "53213477405035", stripePriceId: "price_1U21JrLYqkehBQURsnXHUDag" },
      { id: "s", label: "S", price: 75.00, shopifyVariantId: "53213477437803", stripePriceId: "price_1U21JrLYqkehBQURMsb67zSe" },
      { id: "m", label: "M", price: 75.00, shopifyVariantId: "53213477470571", stripePriceId: "price_1U21JrLYqkehBQURyfFxrjPi" },
      { id: "l", label: "L", price: 75.00, shopifyVariantId: "53213477503339", stripePriceId: "price_1U21JrLYqkehBQURAiae1egi" },
      { id: "xl", label: "XL", price: 75.00, shopifyVariantId: "53213477536107", stripePriceId: "price_1U21JrLYqkehBQURcDcuOj6K" },
    ],
  },
  {
    id: "latte",
    name: "LATTE",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194322575723", stripePriceId: "price_1U21JsLYqkehBQURQnsH24rV" },
    ],
  },
  {
    id: "mercury",
    name: "MERCURY",
    lowStock: true,
    variants: [
      { id: "default", label: null, price: 7.50, shopifyVariantId: "53194338042219", stripePriceId: "price_1U21JsLYqkehBQURXmwzM3Jx" },
    ],
  },
  {
    id: "red-sorceress",
    name: "RED SORCERESS",
    variants: [
      { id: "default", label: null, price: 20.00, shopifyVariantId: "53194320216427", stripePriceId: "price_1U21JsLYqkehBQUROnEVYxIZ" },
    ],
  },
  {
    id: "sheer-pink",
    name: "SHEER PINK",
    variants: [
      { id: "default", label: null, price: 15.00, shopifyVariantId: "53133649183083", stripePriceId: "price_1U21JsLYqkehBQUR2RiI3ECO" },
    ],
  },
];

module.exports = products;
