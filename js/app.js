/* ==========================================================
   CLOUD HUB — app.js
   Age gate · inventory filtering · cart · pickup checkout
   ========================================================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- Age gate ---------- */
const ageGate = $("#ageGate");
if (localStorage.getItem("ch_age_ok") === "1") {
  ageGate.classList.add("hidden");
} else {
  document.body.classList.add("locked");
}
$("#ageYes").addEventListener("click", () => {
  localStorage.setItem("ch_age_ok", "1");
  ageGate.classList.add("hidden");
  document.body.classList.remove("locked");
});
$("#ageNo").addEventListener("click", () => {
  window.location.href = "https://www.google.com";
});

/* ---------- Mobile nav ---------- */
const navLinks = $("#navLinks");
$("#navBurger").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") navLinks.classList.remove("open");
});

/* ---------- State ---------- */
let state = {
  search: "",
  category: "All",
  brand: "",
  sort: "featured",
};
let cart = JSON.parse(localStorage.getItem("ch_cart") || "{}"); // { id: qty }

/* ---------- Build filter chips + brand select ---------- */
const catFilters = $("#catFilters");
CATEGORIES.forEach((cat) => {
  const b = document.createElement("button");
  b.className = "chip" + (cat === "All" ? " active" : "");
  b.textContent = cat;
  b.setAttribute("role", "tab");
  b.addEventListener("click", () => {
    state.category = cat;
    $$(".chip").forEach((c) => c.classList.toggle("active", c === b));
    render();
  });
  catFilters.appendChild(b);
});

const brandFilter = $("#brandFilter");
[...new Set(PRODUCTS.map((p) => p.brand))].sort().forEach((brand) => {
  const o = document.createElement("option");
  o.value = brand;
  o.textContent = brand;
  brandFilter.appendChild(o);
});
brandFilter.addEventListener("change", () => { state.brand = brandFilter.value; render(); });

$("#searchInput").addEventListener("input", (e) => { state.search = e.target.value.trim().toLowerCase(); render(); });
$("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

/* Category cards jump straight to a filtered shop view */
$$(".cat-card").forEach((card) => {
  card.addEventListener("click", () => {
    const cat = card.dataset.jump;
    state.category = cat;
    $$(".chip").forEach((c) => c.classList.toggle("active", c.textContent === cat));
    render();
  });
});

/* ---------- Render products ---------- */
const grid = $("#productGrid");
const emptyState = $("#emptyState");
const resultCount = $("#resultCount");

function filteredProducts() {
  let list = PRODUCTS.filter((p) => {
    if (state.category !== "All" && p.category !== state.category) return false;
    if (state.brand && p.brand !== state.brand) return false;
    if (state.search) {
      const hay = `${p.name} ${p.brand} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(state.search)) return false;
    }
    return true;
  });
  switch (state.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: list.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
  }
  return list;
}

function render() {
  const list = filteredProducts();
  grid.innerHTML = "";
  emptyState.hidden = list.length > 0;
  resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;

  list.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "product";
    card.style.animationDelay = `${Math.min(i * 35, 350)}ms`;
    card.style.setProperty("--art-a", p.colors[0]);
    card.style.setProperty("--art-b", p.colors[1]);
    card.innerHTML = `
      <div class="product__art">
        <span>${p.art}</span>
        <span class="product__badge product__badge--${p.stock}">${p.stock === "in" ? "In stock" : "Low stock"}</span>
        ${p.hot ? '<span class="product__badge product__badge--hot">🔥 Popular</span>' : ""}
      </div>
      <div class="product__body">
        <span class="product__brand">${p.brand}</span>
        <h3 class="product__name">${p.name}</h3>
        <div class="product__meta">${p.tags.map((t) => `<span class="product__tag">${t}</span>`).join("")}</div>
        <div class="product__foot">
          <span class="product__price">$${p.price.toFixed(2)}</span>
          <button class="product__add" data-id="${p.id}">+ Add</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".product__add");
  if (!btn) return;
  addToCart(btn.dataset.id);
});

/* ---------- Cart ---------- */
const cartDrawer = $("#cartDrawer");
const drawerOverlay = $("#drawerOverlay");
const cartItemsEl = $("#cartItems");
const cartCountEl = $("#cartCount");
const cartTotalEl = $("#cartTotal");

function saveCart() { localStorage.setItem("ch_cart", JSON.stringify(cart)); }
function cartEntries() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id), qty }))
    .filter((e) => e.product && e.qty > 0);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateCartUI();
  const p = PRODUCTS.find((x) => x.id === id);
  toast(`Added ${p.art} ${p.brand} to your order`);
  cartCountEl.classList.add("pop");
  setTimeout(() => cartCountEl.classList.remove("pop"), 250);
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const entries = cartEntries();
  const count = entries.reduce((s, e) => s + e.qty, 0);
  const total = entries.reduce((s, e) => s + e.qty * e.product.price, 0);
  cartCountEl.textContent = count;
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  $("#checkoutBtn").disabled = count === 0;

  if (!entries.length) {
    cartItemsEl.innerHTML = `<p class="drawer__empty">Your order is empty.<br>Add something tasty from the inventory 👇</p>`;
    return;
  }
  cartItemsEl.innerHTML = entries.map(({ product: p, qty }) => `
    <div class="cart-item" style="--art-a:${p.colors[0]};--art-b:${p.colors[1]}">
      <div class="cart-item__art">${p.art}</div>
      <div>
        <div class="cart-item__name">${p.name}</div>
        <div class="cart-item__price">$${p.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item__qty">
        <button data-id="${p.id}" data-d="-1" aria-label="Decrease">−</button>
        <b>${qty}</b>
        <button data-id="${p.id}" data-d="1" aria-label="Increase">+</button>
      </div>
    </div>`).join("");
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  changeQty(btn.dataset.id, Number(btn.dataset.d));
});

function openDrawer() { cartDrawer.classList.add("open"); drawerOverlay.classList.add("open"); }
function closeDrawer() { cartDrawer.classList.remove("open"); drawerOverlay.classList.remove("open"); }
$("#cartBtn").addEventListener("click", openDrawer);
$("#drawerClose").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

/* ---------- Checkout ---------- */
const modal = $("#checkoutModal");
$("#checkoutBtn").addEventListener("click", () => {
  if (!cartEntries().length) { toast("Add something to your order first 🙂"); return; }
  closeDrawer();
  $("#checkoutFormWrap").hidden = false;
  $("#checkoutSuccess").hidden = true;
  modal.classList.add("open");
});
$("#modalClose").addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const orderNo = "CH-" + Math.floor(1000 + Math.random() * 9000);
  $("#orderNumber").textContent = orderNo;
  $("#orderPhone").textContent = $("#custPhone").value;
  $("#checkoutFormWrap").hidden = true;
  $("#checkoutSuccess").hidden = false;
  cart = {};
  saveCart();
  updateCartUI();
});
$("#successDone").addEventListener("click", () => modal.classList.remove("open"));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeDrawer(); modal.classList.remove("open"); }
});

/* ---------- Brands marquee ---------- */
const track = $("#brandsTrack");
[...BRANDS, ...BRANDS].forEach((b) => {
  const pill = document.createElement("span");
  pill.className = "brand-pill";
  pill.textContent = b;
  track.appendChild(pill);
});

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Init ---------- */
render();
updateCartUI();
