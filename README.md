# Perfume Zone (perfumezone.uk) – Luxury E-Commerce Web Application

Official web storefront for **Perfume Zone** ([perfumezone.uk](https://perfumezone.uk)), premier UK destination for authentic luxury Arabian fragrances, Oud oils, and Extrait De Parfum.

## Quick Start

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start the development server (client at `http://localhost:5173` and Express API at `http://localhost:4000`):
   ```bash
   npm run dev
   ```

## Routes & Pages

- **Storefront & Catalog**:
  - `/` — Homepage featuring signature houses, hero slider, and USPs
  - `/collections/:handle` — Filterable collection view (Brand, Price, Newest)
  - `/products/:handle` — Product detail page with notes pyramid, quick buy & wishlist
  - `/search` — Live product search
  - `/pages/perfume-offers` — Promotions & coupon codes (`PERFUME10`)

- **E-Commerce & Orders**:
  - `/cart` — Full shopping bag with free delivery threshold meter & promo code
  - `/checkout` — Complete multi-step checkout (Contact, Shipping, Payment with Card, PayPal, Klarna, COD)
  - `/order-confirmation/:id` — Order status tracker & printable receipt
  - `/wishlist` — Saved luxury fragrance flacons
  - `/account` — Customer account dashboard with order history

- **Product Inventory & Excel Import**:
  - `/import` (or `/admin/import`) — In-browser drag-and-drop Excel (`.xlsx`, `.xls`, `.csv`) product importer with column mapping & instant catalog preview
  - CLI Import: `node server/import-excel.js products_template.xlsx`
  - Download template: `products_template.xlsx` or `products_template.csv`

- **Company & Legal**:
  - `/pages/about-us` — Perfume Zone heritage & mission
  - `/pages/contact-us` — Mayfair boutique details & concierge inquiry form
  - `/pages/faqs` — Authenticity, shipping & fragrance care questions
  - `/pages/wholesale` — B2B wholesale distribution partner portal
  - `/tools/locations` — UK boutique showrooms (London, Manchester, Birmingham)
  - `/blogs/fragrance-insights` — Perfumery layering & concentration guides
  - `/policies/*` — Terms of Service, Privacy Policy, Refund Policy, Shipping Policy
