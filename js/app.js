/* ==========================================================
   CLOUD HUB — app.js
   Age gate · inventory filtering · cart · pickup checkout ·
   rewards preview · notification previews
   All demo/frontend-only: state lives in localStorage.
   ========================================================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const money = (n) => `$${n.toFixed(2)}`;

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
const navBurger = $("#navBurger");
navBurger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navBurger.setAttribute("aria-expanded", String(open));
});
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("open");
    navBurger.setAttribute("aria-expanded", "false");
  }
});

/* ---------- State ---------- */
let state = {
  search: "",
  category: "All",
  brand: "",
  sort: "featured",
};
let cart = JSON.parse(localStorage.getItem("ch_cart") || "{}"); // { id: qty }

/* Rewards state (demo only — never leaves this browser) */
let member = JSON.parse(localStorage.getItem("ch_member") || "null"); // {name, phone, email}
let points = Number(localStorage.getItem("ch_points") || 0);
let credit = Number(localStorage.getItem("ch_credit") || 0);
const REWARD_TIERS = [
  { pts: 100, credit: 5 },
  { pts: 250, credit: 15 },
  { pts: 500, credit: 35 },
];
function saveRewards() {
  localStorage.setItem("ch_member", JSON.stringify(member));
  localStorage.setItem("ch_points", String(points));
  localStorage.setItem("ch_credit", String(credit));
}

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

function stockBadge(p) {
  if (p.stock !== "low") return `<span class="product__badge product__badge--in">In stock</span>`;
  const label = p.left ? `Only ${p.left} left` : "Low stock";
  return `<span class="product__badge product__badge--low">${label}</span>`;
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
        ${stockBadge(p)}
        ${p.hot ? '<span class="product__badge product__badge--hot">🔥 Popular</span>' : ""}
      </div>
      <div class="product__body">
        <span class="product__brand">${p.brand}</span>
        <h3 class="product__name">${p.name}</h3>
        <div class="product__meta">${p.tags.map((t) => `<span class="product__tag">${t}</span>`).join("")}</div>
        <div class="product__foot">
          <span class="product__price">${money(p.price)}</span>
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
const cartBar = $("#cartBar");

function saveCart() { localStorage.setItem("ch_cart", JSON.stringify(cart)); }
function cartEntries() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id), qty }))
    .filter((e) => e.product && e.qty > 0);
}
function cartTotals() {
  const entries = cartEntries();
  return {
    entries,
    count: entries.reduce((s, e) => s + e.qty, 0),
    total: entries.reduce((s, e) => s + e.qty * e.product.price, 0),
  };
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
  const { entries, count, total } = cartTotals();
  cartCountEl.textContent = count;
  cartTotalEl.textContent = money(total);
  $("#checkoutBtn").disabled = count === 0;

  /* mobile sticky bar */
  cartBar.hidden = count === 0;
  cartBar.classList.toggle("show", count > 0);
  document.body.classList.toggle("has-cartbar", count > 0);
  $("#cartBarCount").textContent = `${count} item${count === 1 ? "" : "s"}`;
  $("#cartBarTotal").textContent = money(total);

  /* store-credit reminder */
  const creditEl = $("#drawerCredit");
  creditEl.hidden = credit <= 0;
  if (credit > 0) creditEl.textContent = `🎁 You have ${money(credit)} rewards store credit — applied at the register.`;

  if (!entries.length) {
    cartItemsEl.innerHTML = `<p class="drawer__empty">Your order is empty.<br>Add something tasty from the inventory 👇</p>`;
    return;
  }
  cartItemsEl.innerHTML = entries.map(({ product: p, qty }) => `
    <div class="cart-item" style="--art-a:${p.colors[0]};--art-b:${p.colors[1]}">
      <div class="cart-item__art">${p.art}</div>
      <div>
        <div class="cart-item__name">${p.name}</div>
        <div class="cart-item__price">${money(p.price)} each</div>
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
$("#cartBarBtn").addEventListener("click", openDrawer);
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
  const { count, total } = cartTotals();
  const name = $("#custName").value.trim();
  const phone = $("#custPhone").value.trim();
  const when = $("#custTime").value;
  const orderNo = "CH-" + Math.floor(1000 + Math.random() * 9000);
  const firstName = name.split(" ")[0] || "there";

  $("#orderNumber").textContent = orderNo;
  $("#orderPhone").textContent = phone;

  /* Notification previews (illustrative only — nothing sends) */
  const whenPhrase = when.startsWith("ASAP") ? "about 15 minutes" : when.toLowerCase().replace(/^in /, "about ");
  $("#smsCustomer").textContent =
    `Thanks ${firstName}! Your Cloud Hub pickup order ${orderNo} is in — we'll text you when it's ready (${whenPhrase}). ` +
    `Please bring a valid 21+ ID. 📍 7068 W State St, Boise.`;
  $("#smsStaff").innerHTML =
    `<b>🛎 New pickup order ${orderNo}</b><br>` +
    `${count} item${count === 1 ? "" : "s"} · ${money(total)} · ${when}<br>` +
    `${name} — ${phone}`;

  /* Rewards points (demo) */
  const earned = Math.floor(total);
  const pointsEl = $("#successPoints");
  if (member) {
    points += earned;
    saveRewards();
    pointsEl.hidden = false;
    pointsEl.innerHTML = `⭐ +${earned} points added — new balance: <b>${points} pts</b>`;
    renderRewards();
  } else {
    pointsEl.hidden = false;
    pointsEl.innerHTML = `⭐ An order like this would earn <b>${earned} points</b> — <a href="#rewards" id="joinFromOrder">join Cloud Hub Rewards</a>`;
  }

  $("#checkoutFormWrap").hidden = true;
  $("#checkoutSuccess").hidden = false;
  cart = {};
  saveCart();
  updateCartUI();
});
$("#successDone").addEventListener("click", () => modal.classList.remove("open"));
$("#successPoints").addEventListener("click", (e) => {
  if (e.target.id === "joinFromOrder") modal.classList.remove("open");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeDrawer(); modal.classList.remove("open"); }
});

/* ---------- Rewards (demo preview) ---------- */
const rewardsWrap = $("#rewardsWrap");

function nextTier() {
  return REWARD_TIERS.find((t) => t.pts > points) || null;
}

function renderRewards() {
  if (!member) {
    rewardsWrap.innerHTML = `
      <div class="rewards__card">
        <h3>Join Cloud Hub Rewards <span class="preview-tag">Preview</span></h3>
        <p>Earn 1 point per $1 on every pickup order. Points convert to store credit toward your next purchase — applied right at the register.</p>
        <form class="rewards__form" id="rewardsForm">
          <label>Name <input type="text" id="rwName" required placeholder="Your name" autocomplete="name"></label>
          <label>Phone <input type="tel" id="rwPhone" required placeholder="(208) 555-0123" autocomplete="tel"></label>
          <label>Email <input type="email" id="rwEmail" required placeholder="you@example.com" autocomplete="email"></label>
          <button type="submit" class="btn btn--primary btn--block">Create My Rewards Account</button>
        </form>
        <p class="rewards__fine">Demo only — details stay in this browser and are never sent anywhere. Rewards are store credit/discounts, 21+ with valid ID.</p>
      </div>`;
    $("#rewardsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      member = {
        name: $("#rwName").value.trim(),
        phone: $("#rwPhone").value.trim(),
        email: $("#rwEmail").value.trim(),
      };
      points = points || 0;
      saveRewards();
      toast("🎉 Welcome to Cloud Hub Rewards!");
      renderRewards();
    });
    return;
  }

  const next = nextTier();
  const pct = next ? Math.min(100, Math.round((points / next.pts) * 100)) : 100;
  const firstName = member.name.split(" ")[0];

  rewardsWrap.innerHTML = `
    <div class="rewards__card">
      <div class="rewards__hello"><span>Hey ${firstName} 👋</span> <span class="preview-tag">Preview</span></div>
      <div class="rewards__balance"><b>${points}</b><span>points</span></div>
      ${credit > 0 ? `<div class="rewards__credit">🎁 ${money(credit)} store credit ready — applied at the register</div>` : ""}
      <div class="rewards__progress">
        <div class="rewards__progress-bar"><div class="rewards__progress-fill" style="width:${pct}%"></div></div>
        <div class="rewards__progress-label">${next ? `${next.pts - points} pts to your next reward ($${next.credit} off)` : "Top tier reached — redeem below 🏆"}</div>
      </div>
      <div class="rewards__tiers">
        ${REWARD_TIERS.map((t, i) => `
          <div class="tier">
            <div class="tier__info"><b>$${t.credit} off your next order</b><small>${t.pts} points · store credit at register</small></div>
            <button data-tier="${i}" ${points < t.pts ? "disabled" : ""}>Redeem</button>
          </div>`).join("")}
      </div>
      <button class="rewards__signout" id="rewardsReset">Reset demo account</button>
    </div>`;

  rewardsWrap.querySelectorAll(".tier button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = REWARD_TIERS[Number(btn.dataset.tier)];
      if (points < t.pts) return;
      points -= t.pts;
      credit += t.credit;
      saveRewards();
      toast(`🎁 ${money(t.credit)} store credit added — show at register`);
      renderRewards();
      updateCartUI();
    });
  });
  $("#rewardsReset").addEventListener("click", () => {
    member = null; points = 0; credit = 0;
    localStorage.removeItem("ch_member");
    localStorage.removeItem("ch_points");
    localStorage.removeItem("ch_credit");
    renderRewards();
    updateCartUI();
    toast("Demo rewards account reset");
  });
}

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
renderRewards();
