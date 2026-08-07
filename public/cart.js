(function () {
  const PRODUCTS = [
    { id: "baby-brown", name: "BABY BROWN", variants: [{ id: "default", label: null, price: 15.00 }] },
    { id: "baby-peach", name: "BABY PEACH", variants: [{ id: "default", label: null, price: 15.00 }] },
    { id: "baby-pink", name: "BABY PINK", variants: [{ id: "default", label: null, price: 15.00 }] },
    { id: "brown", name: "BROWN", variants: [{ id: "default", label: null, price: 15.00 }] },
    { id: "bubble-gum", name: "BUBBLE GUM", variants: [{ id: "default", label: null, price: 20.00 }] },
    { id: "chocolate", name: "CHOCOLATE", variants: [{ id: "default", label: null, price: 7.50 }] },
    { id: "chocolate-cookie", name: "CHOCOLATE COOKIE", variants: [{ id: "default", label: null, price: 20.00 }] },
    { id: "clear", name: "CLEAR", variants: [{ id: "default", label: null, price: 15.00 }] },
    { id: "clear-2", name: "CLEAR MINI", variants: [{ id: "default", label: null, price: 7.50 }] },
    { id: "coconut", name: "COCONUT", variants: [{ id: "default", label: null, price: 7.50 }] },
    { id: "compact-mirror", name: "KUSH KISSES COMPACT MIRROR", variants: [{ id: "default", label: null, price: 6.99 }] },
    { id: "hand-held-mirror", name: "KUSH KISSES HAND HELD MIRROR", variants: [{ id: "default", label: null, price: 15.00 }] },
    {
      id: "kush-kisses-set",
      name: "KUSH KISSES SET",
      variants: [
        { id: "xs", label: "XS", price: 75.00 },
        { id: "s", label: "S", price: 75.00 },
        { id: "m", label: "M", price: 75.00 },
        { id: "l", label: "L", price: 75.00 },
        { id: "xl", label: "XL", price: 75.00 },
      ],
    },
    { id: "latte", name: "LATTE", variants: [{ id: "default", label: null, price: 20.00 }] },
    { id: "mercury", name: "MERCURY", variants: [{ id: "default", label: null, price: 7.50 }] },
    { id: "red-sorceress", name: "RED SORCERESS", variants: [{ id: "default", label: null, price: 20.00 }] },
    { id: "sheer-pink", name: "SHEER PINK", variants: [{ id: "default", label: null, price: 15.00 }] },
  ];

  const CART_STORAGE_KEY = "kk_cart";

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  let cart = loadCart(); // { cartKey: quantity }  where cartKey = "productId" or "productId:variantId"

  function getProductAndVariant(cartKey) {
    const [productId, variantId] = cartKey.split(":");
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return null;
    const variant = variantId
      ? product.variants.find((v) => v.id === variantId)
      : product.variants[0];
    if (!variant) return null;
    return { product, variant };
  }

  function addToCart(cartKey) {
    cart[cartKey] = (cart[cartKey] || 0) + 1;
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function updateQuantity(cartKey, delta) {
    if (!cart[cartKey]) return;
    cart[cartKey] += delta;
    if (cart[cartKey] <= 0) {
      delete cart[cartKey];
    }
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function removeFromCart(cartKey) {
    delete cart[cartKey];
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function getCartTotal() {
    return Object.entries(cart).reduce((sum, [cartKey, qty]) => {
      const found = getProductAndVariant(cartKey);
      return found ? sum + found.variant.price * qty : sum;
    }, 0);
  }

  function updateCartBadge() {
    const badge = document.getElementById("kk-cart-badge");
    if (!badge) return;
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  function renderCart() {
    const container = document.getElementById("kk-cart-items");
    const totalEl = document.getElementById("kk-cart-total");
    const emptyMsg = document.getElementById("kk-cart-empty");
    const checkoutBtn = document.getElementById("kk-cart-checkout-btn");
    if (!container) return;

    container.innerHTML = "";
    const entries = Object.entries(cart);

    if (entries.length === 0) {
      emptyMsg.style.display = "block";
      checkoutBtn.disabled = true;
    } else {
      emptyMsg.style.display = "none";
      checkoutBtn.disabled = false;

      entries.forEach(([cartKey, qty]) => {
        const found = getProductAndVariant(cartKey);
        if (!found) return;
        const { product, variant } = found;
        const displayName = variant.label ? `${product.name} - ${variant.label}` : product.name;

        const row = document.createElement("div");
        row.className = "kk-cart-row";
        row.innerHTML = `
          <div class="kk-cart-row-left">
            <span class="kk-cart-item-name">${displayName}</span>
          </div>
          <div class="kk-cart-row-right">
            <button class="kk-qty-btn" data-action="decrease" data-id="${cartKey}">-</button>
            <span class="kk-qty-value">${qty}</span>
            <button class="kk-qty-btn" data-action="increase" data-id="${cartKey}">+</button>
            <span class="kk-cart-item-price">$${(variant.price * qty).toFixed(2)}</span>
            <button class="kk-remove-btn" data-action="remove" data-id="${cartKey}">x</button>
          </div>
        `;
        container.appendChild(row);
      });
    }

    totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  }

  function openCart() {
    document.getElementById("kk-cart-modal").classList.add("open");
    renderCart();
  }

  function closeCart() {
    document.getElementById("kk-cart-modal").classList.remove("open");
  }

  async function handleCheckout() {
    const checkoutBtn = document.getElementById("kk-cart-checkout-btn");
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "REDIRECTING...";

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      if (!response.ok) throw new Error("Checkout session creation failed");

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      checkoutBtn.textContent = "CHECKOUT";
      checkoutBtn.disabled = false;
      alert("Something went wrong starting checkout. Please try again.");
    }
  }

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target.matches(".kk-qty-btn")) {
      const id = target.getAttribute("data-id");
      const action = target.getAttribute("data-action");
      updateQuantity(id, action === "increase" ? 1 : -1);
    }
    if (target.matches(".kk-remove-btn")) {
      const id = target.getAttribute("data-id");
      removeFromCart(id);
    }
    if (target.matches(".kk-add-to-cart-btn")) {
      const productId = target.getAttribute("data-id");
      const selectEl = document.querySelector(`select[data-variant-for="${productId}"]`);
      const cartKey = selectEl ? `${productId}:${selectEl.value}` : productId;
      addToCart(cartKey);
    }
    if (target.matches("#kk-cart-icon, #kk-cart-icon *")) {
      openCart();
    }
    if (target.matches("#kk-cart-close, #kk-cart-overlay")) {
      closeCart();
    }
  });

  document.addEventListener("DOMContentLoaded", async function () {
    updateCartBadge();
    const checkoutBtn = document.getElementById("kk-cart-checkout-btn");
    if (checkoutBtn) checkoutBtn.addEventListener("click", handleCheckout);

    try {
      const res = await fetch("/api/cart-config");
      const config = await res.json();
      if (!config.enabled) {
        disableCartSystem();
      }
    } catch (e) {
      console.error("Could not check cart config, leaving cart enabled by default:", e);
    }
  });

  function disableCartSystem() {
    const cartIcon = document.getElementById("kk-cart-icon");
    if (cartIcon) cartIcon.style.display = "none";

    document.querySelectorAll(".kk-add-to-cart-btn").forEach((btn) => {
      const link = document.createElement("a");
      link.className = "kk-product-link";
      link.href = "https://kush-kisses-2.myshopify.com";
      link.textContent = "SHOP";
      btn.replaceWith(link);
    });
  }
})();
