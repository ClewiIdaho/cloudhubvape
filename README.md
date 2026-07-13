# ☁️ Cloud Hub Vape & Smoke — Website Demo

A modern, mobile-friendly storefront demo for **Cloud Hub Vape & Smoke** (7068 W State St, Boise, ID 83714).

## Features

- **21+ age gate** with FDA nicotine warning banner
- **Live inventory browser** — search, category chips, brand filter, sorting, stock badges with low-stock counts
- **Order-ahead pickup flow** — cart drawer, quantity controls, checkout form, order confirmation
- **Cloud Hub Rewards (preview)** — demo loyalty signup, points per order, store-credit redemption tiers; all localStorage, clearly labeled as a preview
- **Notification previews** — mock customer SMS + staff alert shown on order confirmation (illustrative only, nothing sends)
- **Mobile-first** — bottom-sheet cart & checkout, sticky "View Cart" bar, 44px minimum tap targets, zero horizontal scroll at 375/390px
- **Brands marquee**, store info with embedded Google Map, click-to-call
- Open Graph tags + custom favicon for clean link sharing
- Fully responsive, dark neon theme matching the shop's branding, no build step required

## Running it

It's a plain static site — no dependencies, no build.

```bash
# option 1: just open it
open index.html

# option 2: serve it locally
python3 -m http.server 8000
# → http://localhost:8000
```

Or enable **GitHub Pages** (Settings → Pages → deploy from branch) for a shareable live URL.

## Structure

```
index.html      — all page markup
css/style.css   — theme & layout
js/products.js  — sample inventory data (swap for POS feed in production)
js/app.js       — filtering, cart, checkout logic
```

> **Note:** Inventory, prices, and hours are sample/demo data. In production, `products.js` would be replaced by a feed from the shop's POS system and the pickup form would submit to a real order endpoint.
