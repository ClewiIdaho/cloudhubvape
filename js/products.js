/* ==========================================================
   CLOUD HUB — sample inventory data (demo)
   In production this would be fed by the shop's POS system.
   Each product: id, name, brand, category, price, stock
   ("in" | "low"), hot (featured flag), tags, emoji art + colors.
   ========================================================== */

const CATEGORIES = ["All", "Disposables", "Vapes & Mods", "E-Liquids", "Accessories"];

const PRODUCTS = [
  // ---- Disposables ----
  { id: "d1", name: "Elf Bar BC5000 — Blue Razz Ice", brand: "Elf Bar", category: "Disposables",
    price: 19.99, stock: "in", hot: true, tags: ["5000 puffs", "5% nic", "Rechargeable"],
    art: "🧊", colors: ["#1e3a8a", "#0ea5e9"] },
  { id: "d2", name: "Lost Mary OS5000 — Watermelon", brand: "Lost Mary", category: "Disposables",
    price: 18.99, stock: "in", hot: true, tags: ["5000 puffs", "5% nic"],
    art: "🍉", colors: ["#9d174d", "#f472b6"] },
  { id: "d3", name: "Geek Bar Pulse — Miami Mint", brand: "Geek Bar", category: "Disposables",
    price: 21.99, stock: "in", hot: true, tags: ["15000 puffs", "Dual mode", "Screen"],
    art: "🌿", colors: ["#065f46", "#34d399"] },
  { id: "d4", name: "Geek Bar Pulse — Sour Apple Ice", brand: "Geek Bar", category: "Disposables",
    price: 21.99, stock: "low", tags: ["15000 puffs", "Dual mode"],
    art: "🍏", colors: ["#3f6212", "#a3e635"] },
  { id: "d5", name: "Juice Head 5K — Peach Pear", brand: "Juice Head", category: "Disposables",
    price: 17.99, stock: "in", tags: ["5000 puffs", "5% nic"],
    art: "🍑", colors: ["#7c2d12", "#fb923c"] },
  { id: "d6", name: "Air Bar AB5000 — Berry Shake", brand: "Air Bar", category: "Disposables",
    price: 16.99, stock: "in", tags: ["5000 puffs", "Mesh coil"],
    art: "🫐", colors: ["#312e81", "#818cf8"] },
  { id: "d7", name: "Bearr AR5000 — Cool Mint", brand: "Bearr", category: "Disposables",
    price: 15.99, stock: "low", tags: ["5000 puffs", "5% nic"],
    art: "❄️", colors: ["#155e75", "#67e8f9"] },
  { id: "d8", name: "Lost Mary MO5000 — Grape Jelly", brand: "Lost Mary", category: "Disposables",
    price: 19.99, stock: "in", tags: ["5000 puffs", "Rechargeable"],
    art: "🍇", colors: ["#581c87", "#c084fc"] },

  // ---- Vapes & Mods ----
  { id: "v1", name: "SMOK Morph 3 Kit 230W + T-Air Tank", brand: "SMOK", category: "Vapes & Mods",
    price: 59.99, stock: "in", hot: true, tags: ["230W", "Dual 18650", "0.96\" screen"],
    art: "🔥", colors: ["#111827", "#ef4444"] },
  { id: "v2", name: "VOOPOO Drag 4 Kit 177W", brand: "VOOPOO", category: "Vapes & Mods",
    price: 64.99, stock: "in", hot: true, tags: ["GENE.FAN 3.0", "Leather grip"],
    art: "⚡", colors: ["#1f2937", "#f59e0b"] },
  { id: "v3", name: "Geekvape Aegis Legend 3 — Rainbow", brand: "Geekvape", category: "Vapes & Mods",
    price: 69.99, stock: "low", tags: ["IP68 rated", "Shockproof", "200W"],
    art: "🌈", colors: ["#4c1d95", "#ec4899"] },
  { id: "v4", name: "UWELL Caliburn G3 Pod Kit", brand: "UWELL", category: "Vapes & Mods",
    price: 32.99, stock: "in", tags: ["25W", "Pod system", "USB-C"],
    art: "💠", colors: ["#0c4a6e", "#38bdf8"] },
  { id: "v5", name: "VOOPOO Vinci Q Pod — Neon Blue", brand: "VOOPOO", category: "Vapes & Mods",
    price: 24.99, stock: "in", tags: ["Pod system", "900mAh"],
    art: "💎", colors: ["#1e3a8a", "#60a5fa"] },
  { id: "v6", name: "SMOK Nord 5 Pod Kit 80W", brand: "SMOK", category: "Vapes & Mods",
    price: 39.99, stock: "in", tags: ["80W", "2000mAh", "RPM 3 coils"],
    art: "🧿", colors: ["#134e4a", "#2dd4bf"] },

  // ---- E-Liquids ----
  { id: "e1", name: "Pacha Mama — Fuji Apple Strawberry Nectarine", brand: "Pacha Mama", category: "E-Liquids",
    price: 24.99, stock: "in", hot: true, tags: ["60mL", "Freebase", "3/6mg"],
    art: "🍎", colors: ["#7f1d1d", "#f87171"] },
  { id: "e2", name: "Nasty Juice — Cush Man Mango", brand: "Nasty Juice", category: "E-Liquids",
    price: 22.99, stock: "in", tags: ["60mL", "Freebase", "Low mint"],
    art: "🥭", colors: ["#78350f", "#fbbf24"] },
  { id: "e3", name: "Reds Apple Ejuice — Apple Iced", brand: "Reds Apple", category: "E-Liquids",
    price: 21.99, stock: "in", tags: ["60mL", "3/6mg", "Iced"],
    art: "🍏", colors: ["#14532d", "#4ade80"] },
  { id: "e4", name: "Candy King — Batch (Sour Candy)", brand: "Candy King", category: "E-Liquids",
    price: 23.99, stock: "low", tags: ["100mL", "Freebase"],
    art: "🍬", colors: ["#701a75", "#e879f9"] },
  { id: "e5", name: "Jam Monster — Strawberry", brand: "Jam Monster", category: "E-Liquids",
    price: 25.99, stock: "in", tags: ["100mL", "Butter toast jam"],
    art: "🍓", colors: ["#881337", "#fb7185"] },
  { id: "e6", name: "Juice Head Salts — Blueberry Lemon", brand: "Juice Head", category: "E-Liquids",
    price: 17.99, stock: "in", tags: ["30mL", "Salt nic", "25/50mg"],
    art: "🍋", colors: ["#1e40af", "#facc15"] },
  { id: "e7", name: "Pacha Syn Salts — Starfruit Grape", brand: "Pacha Mama", category: "E-Liquids",
    price: 16.99, stock: "in", tags: ["30mL", "Salt nic"],
    art: "⭐", colors: ["#4c1d95", "#a78bfa"] },

  // ---- Accessories ----
  { id: "a1", name: "SMOK RPM 3 Replacement Coils (5-pack)", brand: "SMOK", category: "Accessories",
    price: 14.99, stock: "in", tags: ["0.15Ω mesh", "5-pack"],
    art: "🌀", colors: ["#1f2937", "#9ca3af"] },
  { id: "a2", name: "UWELL Caliburn G3 Pods (4-pack)", brand: "UWELL", category: "Accessories",
    price: 15.99, stock: "in", tags: ["0.6Ω / 0.9Ω", "4-pack"],
    art: "📦", colors: ["#0c4a6e", "#7dd3fc"] },
  { id: "a3", name: "Molicel P28A 18650 Battery", brand: "Molicel", category: "Accessories",
    price: 9.99, stock: "in", tags: ["2800mAh", "35A"],
    art: "🔋", colors: ["#14532d", "#86efac"] },
  { id: "a4", name: "Nitecore Q2 2-Bay Battery Charger", brand: "Nitecore", category: "Accessories",
    price: 19.99, stock: "low", tags: ["2A quick charge"],
    art: "⚡", colors: ["#713f12", "#fde047"] },
  { id: "a5", name: "Clapton Wire Spool 0.45Ω", brand: "Cloud Hub", category: "Accessories",
    price: 7.99, stock: "in", tags: ["DIY builds", "10ft"],
    art: "🧵", colors: ["#3f3f46", "#d4d4d8"] },
  { id: "a6", name: "Zippered Vape Travel Case", brand: "Cloud Hub", category: "Accessories",
    price: 12.99, stock: "in", tags: ["Fits kit + juice", "Shockproof"],
    art: "🧳", colors: ["#18181b", "#71717a"] },
];

const BRANDS = ["SMOK", "VOOPOO", "UWELL", "Geekvape", "Elf Bar", "Lost Mary", "Juice Head", "Air Bar", "Geek Bar", "Pacha Mama", "Nasty Juice", "Candy King", "Jam Monster", "Reds Apple"];
