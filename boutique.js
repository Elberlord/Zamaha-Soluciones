/* Demo e-commerce Zamaha: Bolsos/Carteras
   - Catálogo + filtros + búsqueda
   - Quick view (dialog)
   - Carrito tipo drawer con localStorage
   - Checkout simulado + WhatsApp
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const fmtCRC = (n) => `₡ ${Math.round(n).toLocaleString("es-CR")}`;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function svgDataUri({ accent = "#6b2a52", accent2 = "#c06b95", name = "Bolso" } = {}) {
  // Simple ilustración SVG (bolso estilizado) en data URI
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="520" height="360" viewBox="0 0 520 360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="${accent2}"/>
      </linearGradient>
      <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#000" flood-opacity=".18"/>
      </filter>
    </defs>

    <rect x="0" y="0" width="520" height="360" rx="28" fill="rgba(255,255,255,.0)"/>
    <path d="M160 120c0-52 34-84 100-84s100 32 100 84" fill="none" stroke="url(#g)" stroke-width="14" stroke-linecap="round" opacity=".85"/>
    <path d="M140 128h240c16 0 30 13 30 30v140c0 16-13 30-30 30H140c-16 0-30-13-30-30V158c0-16 13-30 30-30z"
          fill="url(#g)" filter="url(#s)"/>
    <path d="M158 154h204c10 0 18 8 18 18v18c0 10-8 18-18 18H158c-10 0-18-8-18-18v-18c0-10 8-18 18-18z"
          fill="rgba(255,255,255,.22)"/>
    <circle cx="196" cy="210" r="6" fill="rgba(255,255,255,.55)"/>
    <circle cx="324" cy="210" r="6" fill="rgba(255,255,255,.55)"/>
    <path d="M200 210c18 18 38 28 60 28s42-10 60-28" stroke="rgba(255,255,255,.55)" stroke-width="6" stroke-linecap="round" fill="none"/>
    <text x="50%" y="92%" text-anchor="middle" font-family="Inter, Arial" font-size="20" fill="rgba(27,21,32,.72)">${escapeHtml(name)}</text>
  </svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function variantKey(baseId, colorHex){
  return `${baseId}::${colorHex || "na"}`;
}

function colorNameForProduct(p, colorIndex){
  const names = p.colorNames || [];
  if (names[colorIndex]) return names[colorIndex];
  const hex = (p.colors && p.colors[colorIndex]) ? p.colors[colorIndex] : "";
  return hex ? hex.toUpperCase() : "—";
}

const products = [
  {
    id: "nocturna",
    name: "Bolso “Nocturna”",
    cat: "bolsos",
    price: 18900,
    oldPrice: 22500,
    tag: "Nuevo",
    desc: "Estructura firme, herrajes dorados y forro satinado. Ideal para oficina y eventos.",
    colors: ["#6b2a52", "#1f1a22", "#c06b95"],
    colorNames: ["Ciruela", "Negro", "Rosa"],
    stock: 7,
    createdAt: "2026-01-05",
    art: svgDataUri({ accent: "#6b2a52", accent2: "#c06b95", name: "Nocturna" }),
  },
  {
    id: "rosa-suave",
    name: "Cartera “Rosa Suave”",
    cat: "carteras",
    price: 7900,
    tag: "Best seller",
    desc: "Compacta, con separadores y cierre seguro. Cabe perfecto en bolso pequeño.",
    colors: ["#c06b95", "#f0d9e6", "#6b2a52"],
    colorNames: ["Rosa", "Talco", "Ciruela"],
    stock: 18,
    createdAt: "2025-12-18",
    art: svgDataUri({ accent: "#c06b95", accent2: "#6b2a52", name: "Rosa Suave" }),
  },
  {
    id: "tote-marfil",
    name: "Tote “Marfil”",
    cat: "bolsos",
    price: 14900,
    tag: "Formal",
    desc: "Espacio para laptop, agenda y cosmetiquera. Asas cómodas para uso diario.",
    colors: ["#efe6df", "#6b2a52"],
    colorNames: ["Marfil", "Ciruela"],
    stock: 9,
    createdAt: "2025-12-28",
    art: svgDataUri({ accent: "#6b2a52", accent2: "#d7b4c8", name: "Marfil" }),
  },
  {
    id: "clutch-noche",
    name: "Clutch “Noche de Gala”",
    cat: "accesorios",
    price: 9900,
    tag: "Evento",
    desc: "Pequeña, elegante y con brillo sobrio. Para lo esencial: llaves, tarjeta y labial.",
    colors: ["#1f1a22", "#c98cff"],
    colorNames: ["Negro", "Lavanda"],
    stock: 6,
    createdAt: "2026-01-02",
    art: svgDataUri({ accent: "#1f1a22", accent2: "#c98cff", name: "Gala" }),
  },
  {
    id: "mochila-city",
    name: "Mochila “City Chic”",
    cat: "mochilas",
    price: 16900,
    tag: "Urbano",
    desc: "Minimalista y cómoda. Bolsillo oculto, cierre reforzado y look profesional.",
    colors: ["#6b2a52", "#2d2a33", "#efe6df"],
    colorNames: ["Ciruela", "Grafito", "Marfil"],
    stock: 10,
    createdAt: "2025-11-30",
    art: svgDataUri({ accent: "#6b2a52", accent2: "#2d2a33", name: "City Chic" }),
  },
  {
    id: "crossbody",
    name: "Crossbody “Aura”",
    cat: "bolsos",
    price: 12900,
    tag: "Ligero",
    desc: "Manos libres con estilo. Correa ajustable y bolsillo frontal con broche.",
    colors: ["#c06b95", "#6b2a52", "#efe6df"],
    colorNames: ["Rosa", "Ciruela", "Marfil"],
    stock: 14,
    createdAt: "2025-12-22",
    art: svgDataUri({ accent: "#c06b95", accent2: "#6b2a52", name: "Aura" }),
  },
  {
    id: "billetera-lux",
    name: "Billetera “Lux”",
    cat: "carteras",
    price: 8500,
    tag: "Premium",
    desc: "Textura suave, cierre metálico y compartimentos para tarjetas + billetes.",
    colors: ["#6b2a52", "#c98cff"],
    colorNames: ["Ciruela", "Lavanda"],
    stock: 12,
    createdAt: "2025-12-10",
    art: svgDataUri({ accent: "#6b2a52", accent2: "#c98cff", name: "Lux" }),
  },
  {
    id: "correa-perla",
    name: "Correa “Perla” (accesorio)",
    cat: "accesorios",
    price: 6500,
    tag: "Extra",
    desc: "Cambia el look del bolso en segundos. Mosquetones reforzados.",
    colors: ["#efe6df", "#c06b95"],
    colorNames: ["Marfil", "Rosa"],
    stock: 25,
    createdAt: "2025-12-02",
    art: svgDataUri({ accent: "#efe6df", accent2: "#c06b95", name: "Perla" }),
  },
];

const state = {
  q: "",
  cat: "all",
  sort: "featured",
  max: 30000,
  modalProduct: null,
  modalQty: 1,
  modalColorIndex: 0,
  cart: loadCart(),
  theme: loadTheme(),
};

function loadTheme() {
  const saved = localStorage.getItem("zamaha_demo_theme");
  return saved === "dark" ? "dark" : "light";
}
function saveTheme(theme) {
  localStorage.setItem("zamaha_demo_theme", theme);
}
function applyTheme() {
  document.documentElement.dataset.theme = state.theme === "dark" ? "dark" : "";
  const pressed = state.theme === "dark";
  $("#themeToggle").setAttribute("aria-pressed", String(pressed));
  $("#themeToggle .chip__text").textContent = pressed ? "Oscuro" : "Claro";
  $("#themeToggle span[aria-hidden='true']").textContent = pressed ? "☀" : "☾";
}

function loadCart() {
  try {
    const raw = localStorage.getItem("zamaha_demo_cart");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCart() {
  localStorage.setItem("zamaha_demo_cart", JSON.stringify(state.cart));
}

function cartCount() {
  return Object.values(state.cart).reduce((a, b) => a + b.qty, 0);
}

function cartSubtotal() {
  return Object.values(state.cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

function shippingCost(subtotal) {
  // Demo: envío gratis a partir de ₡20,000
  if (subtotal === 0) return 0;
  return subtotal >= 20000 ? 0 : 1500;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function filteredProducts() {
  const q = state.q.trim().toLowerCase();
  let list = products.filter(p => {
    const matchesCat = state.cat === "all" ? true : p.cat === state.cat;
    const matchesPrice = p.price <= state.max;
    const matchesQ = q
      ? (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q))
      : true;
    return matchesCat && matchesPrice && matchesQ;
  });

  const sort = state.sort;
  if (sort === "price-asc") list.sort((a,b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a,b) => b.price - a.price);
  if (sort === "newest") list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sort === "featured") {
    // Preferir "Nuevo" y "Best seller", luego por fecha
    const score = (p) => (p.tag === "Nuevo" ? 3 : p.tag === "Best seller" ? 2 : 1) * 1000000 + new Date(p.createdAt).getTime();
    list.sort((a,b) => score(b) - score(a));
  }

  return list;
}

function renderGrid() {
  const grid = $("#productGrid");
  const list = filteredProducts();

  if (list.length === 0) {
    grid.innerHTML = `<div class="muted">No hay resultados con esos filtros. Prueba otra búsqueda o sube el precio máximo.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="card__media">
        <img src="${p.art}" alt="${escapeHtml(p.name)}" loading="lazy" />
      </div>
      <div class="card__body">
        <div class="card__title">${escapeHtml(p.name)}</div>
        <div class="card__meta">
          <div class="price">${fmtCRC(p.price)}</div>
          <div class="tag">${escapeHtml(p.tag)}</div>
        </div>
        <div class="card__desc">${escapeHtml(p.desc)}</div>
        <div class="card__actions">
          <button class="btn btn--ghost" type="button" data-view="${p.id}">Ver</button>
          <button class="btn" type="button" data-add="${p.id}">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");

  // eventos
  $$("[data-view]").forEach(btn => btn.addEventListener("click", () => openProduct(btn.dataset.view)));
  $$("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.add, 1, 0)));
}

function renderFeatured() {
  const p = products.find(x => x.id === "nocturna");
  const box = $("#featuredArt");
  box.innerHTML = `<img src="${p.art}" alt="Bolso destacado" />`;
  $("#addFeatured").onclick = () => addToCart("nocturna", 1, 0);
}

function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  state.modalProduct = p;
  state.modalQty = 1;
  state.modalColorIndex = 0;

  $("#modalMedia").innerHTML = `<img src="${p.art}" alt="${escapeHtml(p.name)}" />`;
  $("#modalTitle").textContent = p.name;
  $("#modalSub").textContent = p.desc;
  $("#modalPrice").textContent = fmtCRC(p.price);
  $("#modalStock").textContent = `Stock: ${p.stock}`;

  $("#modalColors").innerHTML = p.colors.map((c, idx) => {
    const pressed = idx === state.modalColorIndex;
    return `<button type="button" class="swatch-btn" data-swatch="${idx}" aria-pressed="${pressed}">
      <span class="swatch-dot" style="background:${c}"></span>
    </button>`;
  }).join("");
  $("#qtyInput").value = "1";

  // Swatches (selección de color)
  $$("#modalColors [data-swatch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.modalColorIndex = parseInt(btn.dataset.swatch, 10) || 0;
      $$("#modalColors [data-swatch]").forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
    });
  });

  $("#productModal").showModal();
}

function closeProduct() {
  $("#productModal").close();
}

function addToCart(id, qty, colorIndex = 0) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const colorHex = (p.colors && p.colors[colorIndex]) ? p.colors[colorIndex] : null;
  const colorName = colorNameForProduct(p, colorIndex);
  const key = variantKey(p.id, colorHex);
  const existing = state.cart[key];
  const nextQty = clamp((existing?.qty || 0) + qty, 1, 99);

  state.cart[key] = {
    key,
    baseId: p.id,
    colorHex,
    colorName,

    id: p.id,
    name: p.name,
    cat: p.cat,
    price: p.price,
    art: p.art,
    tag: p.tag,
    qty: nextQty,
  };
  saveCart();
  updateCartUI();
  toast(`Añadido al carrito · ${colorName}`);
}

function setCartQty(key, qty) {
  if (!state.cart[key]) return;
  const q = clamp(qty, 1, 99);
  state.cart[key].qty = q;
  saveCart();
  updateCartUI();
}

function removeFromCart(key) {
  delete state.cart[key];
  saveCart();
  updateCartUI();
}

function clearCart() {
  state.cart = {};
  saveCart();
  updateCartUI();
}

function openCart() {
  const d = $("#cartDrawer");
  d.classList.add("is-open");
  d.setAttribute("aria-hidden", "false");
  // focus
  setTimeout(() => $("#checkoutBtn").focus(), 0);
}

function closeCart() {
  const d = $("#cartDrawer");
  d.classList.remove("is-open");
  d.setAttribute("aria-hidden", "true");
  $("#cartBtn").focus();
}

function cartWhatsAppLink() {
  const items = Object.values(state.cart);
  const lines = items.map(i => {
    const variant = i.colorName ? ` · ${i.colorName}` : "";
    return `• ${i.qty} x ${i.name}${variant} (${fmtCRC(i.price)})`;
  });
  const subtotal = cartSubtotal();
  const ship = shippingCost(subtotal);
  const total = subtotal + ship;

  const msg = [
    "Hola, quiero hacer este pedido (demo):",
    "",
    ...lines,
    "",
    `Subtotal: ${fmtCRC(subtotal)}`,
    `Envío: ${fmtCRC(ship)}`,
    `Total: ${fmtCRC(total)}`,
    "",
    "¿Me confirmas disponibilidad y tiempo de entrega?"
  ].join("\n");

  return `https://wa.me/50664305227?text=${encodeURIComponent(msg)}`;
}

function renderCart() {
  const wrap = $("#cartItems");
  const items = Object.values(state.cart);

  if (items.length === 0) {
    wrap.innerHTML = `<div class="muted">Tu carrito está vacío. Elige algo bonito del catálogo ✨</div>`;
  } else {
    wrap.innerHTML = items.map(i => `
      <div class="cart-item">
        <div class="cart-item__thumb">
          <img src="${i.art}" alt="" aria-hidden="true" />
        </div>
        <div>
          <div class="cart-item__title">${escapeHtml(i.name)}</div>
          <div class="cart-item__sub">${escapeHtml(i.tag)} · ${escapeHtml(i.cat)}</div>
${i.colorHex ? `<div class="cart-color"><span class="cart-color__dot" style="background:${i.colorHex}"></span>Color: ${escapeHtml(i.colorName || i.colorHex)}</div>` : ""}

          <div class="cart-item__row">
            <div class="qty small-qty" aria-label="Cantidad">
              <button type="button" class="qty__btn" data-qminus="${i.key}">−</button>
              <input class="qty__input" data-qinput="${i.key}" value="${i.qty}" />
              <button type="button" class="qty__btn" data-qplus="${i.key}">+</button>
            </div>

            <div style="display:flex; align-items:center; gap:10px;">
              <div class="cart-item__price">${fmtCRC(i.price * i.qty)}</div>
              <button type="button" class="icon-btn" data-remove="${i.key}" aria-label="Quitar">🗑</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    $$("[data-qminus]").forEach(b => b.onclick = () => setCartQty(b.dataset.qminus, (state.cart[b.dataset.qminus].qty || 1) - 1));
    $$("[data-qplus]").forEach(b => b.onclick = () => setCartQty(b.dataset.qplus, (state.cart[b.dataset.qplus].qty || 1) + 1));
    $$("[data-qinput]").forEach(inp => {
      inp.addEventListener("input", () => {
        const v = parseInt(inp.value.replace(/[^\d]/g, ""), 10);
        if (Number.isFinite(v)) setCartQty(inp.dataset.qinput, v);
      });
    });
    $$("[data-remove]").forEach(b => b.onclick = () => removeFromCart(b.dataset.remove));
  }

  const subtotal = cartSubtotal();
  const ship = shippingCost(subtotal);
  const total = subtotal + ship;

  $("#subTotal").textContent = fmtCRC(subtotal);
  $("#ship").textContent = fmtCRC(ship);
  $("#grandTotal").textContent = fmtCRC(total);

  const count = cartCount();
  $("#cartCount").textContent = String(count);
  $("#cartCount").setAttribute("aria-label", `${count} productos en el carrito`);

  $("#waCheckout").href = cartWhatsAppLink();

  // checkout summary modal
  $("#ckTotal").textContent = fmtCRC(total);
  $("#ckItems").innerHTML = Object.values(state.cart).map(i => `
    <div class="ck-item">
      <div>
        <div><strong>${escapeHtml(i.name)}</strong></div>
${i.colorName ? `<div class="muted">Color: ${escapeHtml(i.colorName)}</div>` : ""}
        <div class="muted">${i.qty} x ${fmtCRC(i.price)}</div>
      </div>
      <div><strong>${fmtCRC(i.price * i.qty)}</strong></div>
    </div>
  `).join("");

  $("#ckWa").href = cartWhatsAppLink();
}


function migrateCartShape(){
  // Compatibilidad con carritos viejos (sin key/variante)
  const entries = Object.entries(state.cart || {});
  let changed = false;
  const next = {};
  for (const [k, v] of entries){
    if (!v) continue;
    if (v.key && v.baseId) {
      next[v.key] = v;
      continue;
    }
    // intento de construir key (si hay baseId o id)
    const baseId = v.baseId || v.id || k;
    const colorHex = v.colorHex || null;
    const key = v.key || variantKey(baseId, colorHex);
    next[key] = { key, baseId, colorHex, colorName: v.colorName || (colorHex ? colorHex.toUpperCase() : ""), ...v };
    changed = true;
  }
  if (changed){
    state.cart = next;
    saveCart();
  } else {
    state.cart = next;
  }
}

function updateCartUI() {
  migrateCartShape();
  renderCart();
}

function openCheckout() {
  if (cartCount() === 0) {
    toast("Tu carrito está vacío");
    return;
  }
  $("#checkoutModal").showModal();
}

function confirmOrderDemo() {
  const name = $("#ckName").value.trim();
  const addr = $("#ckAddr").value.trim();
  const pay = $("#ckPay").value;

  if (!name || !addr) {
    $("#ckNote").textContent = "Completa nombre y dirección (demo).";
    return;
  }

  const subtotal = cartSubtotal();
  const ship = shippingCost(subtotal);
  const total = subtotal + ship;

  const items = Object.values(state.cart).map(i => {
    const variant = i.colorName ? ` · ${i.colorName}` : "";
    return `• ${i.qty} x ${i.name}${variant} (${fmtCRC(i.price)})`;
  }).join("\n");
  const msg = [
    `Hola, soy ${name}. Quiero confirmar este pedido (demo):`,
    "",
    items,
    "",
    `Dirección: ${addr}`,
    `Pago: ${pay === "stripe" ? "Tarjeta (Stripe)" : pay === "sinpe" ? "SINPE" : pay === "transfer" ? "Transferencia" : "Contra entrega"}`,
    "",
    `Total: ${fmtCRC(total)}`,
  ].join("\n");

  $("#ckWa").href = `https://wa.me/50664305227?text=${encodeURIComponent(msg)}`;
  $("#ckNote").textContent = "Pedido preparado. Puedes enviarlo por WhatsApp (demo).";
  toast("Pedido listo (demo)");
}

function wireUI() {
  // Año
  $("#year").textContent = String(new Date().getFullYear());

  // Theme
  state.theme = loadTheme();
  applyTheme();
  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveTheme(state.theme);
    applyTheme();
  });

  // Search
  $(".search").addEventListener("submit", (e) => {
    e.preventDefault();
    state.q = $("#q").value;
    renderGrid();
  });

  // Filters
  $("#cat").addEventListener("change", (e) => { state.cat = e.target.value; renderGrid(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });

  $("#max").addEventListener("input", (e) => {
    state.max = parseInt(e.target.value, 10);
    $("#maxLabel").textContent = fmtCRC(state.max);
    renderGrid();
  });

  // Modal qty
  $("#qtyMinus").addEventListener("click", () => {
    state.modalQty = clamp(state.modalQty - 1, 1, 99);
    $("#qtyInput").value = String(state.modalQty);
  });
  $("#qtyPlus").addEventListener("click", () => {
    state.modalQty = clamp(state.modalQty + 1, 1, 99);
    $("#qtyInput").value = String(state.modalQty);
  });
  $("#qtyInput").addEventListener("input", () => {
    const v = parseInt($("#qtyInput").value.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(v)) state.modalQty = clamp(v, 1, 99);
    $("#qtyInput").value = String(state.modalQty);
  });

  $("#modalAdd").addEventListener("click", () => {
    if (!state.modalProduct) return;
    addToCart(state.modalProduct.id, state.modalQty, state.modalColorIndex);
    closeProduct();
  });

  $("#productModal").addEventListener("click", (e) => {
    // Cerrar si se clickea fuera del contenido
    const rect = $(".modal__shell", $("#productModal")).getBoundingClientRect();
    const inBox = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inBox) closeProduct();
  });

  // Cart drawer
  $("#cartBtn").addEventListener("click", openCart);
  $("#cartDrawer").addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeCart();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if ($("#cartDrawer").classList.contains("is-open")) closeCart();
    }
  });

  $("#checkoutBtn").addEventListener("click", () => {
    closeCart();
    openCheckout();
  });

  $("#clearCart").addEventListener("click", () => {
    clearCart();
    toast("Carrito vaciado");
  });

  // Checkout
  $("#confirmOrder").addEventListener("click", confirmOrderDemo);

  // Lead form demo
  $("#leadForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = e.target.elements.name?.value?.trim() || "Cliente";
    $("#leadNote").textContent = `Listo (demo). Si esto fuera real, se enviaría a WhatsApp o correo. Gracias, ${name}.`;
    toast("Formulario enviado (demo)");
    e.target.reset();
  });
}

function init() {
  renderFeatured();
  renderGrid();
  updateCartUI();
  wireUI();
}

init();
