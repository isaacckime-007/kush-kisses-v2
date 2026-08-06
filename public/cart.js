(function () {
  const PRODUCTS = [
    { id: "baby-peach", name: "BABY PEACH", price: 15.00, color: "#FDDAB5" },
    { id: "baby-pink", name: "BABY PINK", price: 15.00, color: "#F2A0BC" },
    { id: "baby-brown", name: "BABY BROWN", price: 15.00, color: "#8B5C42" },
    { id: "brown", name: "BROWN", price: 15.00, color: "#5C3A28" },
    { id: "kush-kisses-set", name: "KUSH KISSES SET", price: 75.00, color: "#e8e6e1" },
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

  let cart = loadCart();

  function addToCart(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function updateQuantity(productId, delta) {
    if (!cart[productId]) return;
    cart[productId] += delta;
    if (cart[productId] <= 0) {
      delete cart[productId];
    }
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function removeFromCart(productId) {
    delete cart[productId];
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function getCartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return product ? sum + product.price * qty : sum;
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

      entries.forEach(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === id);
        if (!product) return;

        const row = document.createElement("div");
        row.className = "kk-cart-row";
        row.innerHTML = `
          <div class="kk-cart-row-left">
            <div class="kk-cart-dot" style="background:${product.color};"></div>
            <span class="kk-cart-item-name">${product.name}</span>
          </div>
          <div class="kk-cart-row-right">
            <button class="kk-qty-btn" data-action="decrease" data-id="${id}">-</button>
            <span class="kk-qty-value">${qty}</span>
            <button class="kk-qty-btn" data-action="increase" data-id="${id}">+</button>
            <span class="kk-cart-item-price">$${(product.price * qty).toFixed(2)}</span>
            <button class="kk-remove-btn" data-action="remove" data-id="${id}">x</button>
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
      const id = target.getAttribute("data-id");
      addToCart(id);
    }
    if (target.matches("#kk-cart-icon, #kk-cart-icon *")) {
      openCart();
    }
    if (target.matches("#kk-cart-close, #kk-cart-overlay")) {
      closeCart();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    updateCartBadge();
    const checkoutBtn = document.getElementById("kk-cart-checkout-btn");
    if (checkoutBtn) checkoutBtn.addEventListener("click", handleCheckout);
  });
})();
