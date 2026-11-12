import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

function readJsonFile(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    console.warn(`Failed reading ${filePath}:`, err.message);
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`Failed writing ${filePath}:`, err.message);
  }
}

const { Pool } = pg;

const useSsl = process.env.DB_SSL === 'true';

const DB_CONFIG = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2500
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME || 'perfumezone',
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2500
    };

const pool = new Pool(DB_CONFIG);

pool.on('error', (err) => {
  console.warn('PostgreSQL pool error:', err.message);
  isDbConnected = false;
});

let isDbConnected = false;
let isCheckingDb = false;

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const handleToTitle = (handle) =>
  String(handle || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

function formatProduct(row) {
  if (!row) return null;
  let notes = row.notes || {};
  if (typeof notes === 'string') {
    try {
      notes = JSON.parse(notes);
    } catch {
      notes = {};
    }
  }
  return {
    id: Number(row.id),
    handle: row.handle,
    title: row.title,
    brand: row.brand || '',
    price: Number(row.price || 0),
    compare_at_price:
      row.compare_at_price !== null && row.compare_at_price !== undefined
        ? Number(row.compare_at_price)
        : null,
    image_url: row.image_url || '',
    image_url_2: row.image_url_2 || '',
    description: row.description || '',
    size: row.size || '100ml Eau De Parfum',
    collections: row.collections || '',
    notes,
    in_stock:
      row.in_stock !== undefined && row.in_stock !== null
        ? Number(row.in_stock)
        : 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function formatOrder(row, lineItems = null) {
  if (!row) return null;
  let items = Array.isArray(lineItems) && lineItems.length ? lineItems : row.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }
  if (!Array.isArray(items)) items = [];

  items = items.map((item) => ({
    id: item.id || item.product_id || null,
    handle: item.handle || item.product_handle || null,
    title: item.title || '',
    brand: item.brand || '',
    size: item.size || '',
    price: Number(item.price ?? item.unit_price ?? 0),
    qty: Number(item.qty ?? item.quantity ?? 1),
    image: item.image || item.image_url || ''
  }));

  return {
    id: row.id,
    userId: row.user_id || null,
    email: row.email,
    customerName:
      row.customer_name ||
      row.customerName ||
      `${row.shippingAddress?.firstName || ''} ${row.shippingAddress?.lastName || ''}`.trim(),
    shippingAddress: row.shippingAddress || {
      address: row.address || '',
      apartment: row.apartment || '',
      city: row.city || '',
      postcode: row.postcode || '',
      country: row.country || 'United Kingdom',
      phone: row.phone || ''
    },
    items,
    subtotal: Number(row.subtotal || 0),
    shippingCost: Number(row.shipping_cost ?? row.shippingCost ?? 0),
    discount: Number(row.discount || 0),
    couponCode: row.coupon_code || row.couponCode || null,
    total: Number(row.total || 0),
    shippingMethod: row.shipping_method || row.shippingMethod || 'standard',
    paymentMethod: row.payment_method || row.paymentMethod || 'card',
    orderNote: row.order_note || row.orderNote || null,
    trackingNumber: row.tracking_number || row.trackingNumber || '',
    courier: row.courier || 'Royal Mail Tracked',
    adminNote: row.admin_note || row.adminNote || '',
    status: row.status || 'Confirmed',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || row.created_at || null
  };
}

// Fallback in-memory dataset for resilience when PostgreSQL is offline
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    handle: 'oud-elixir-dubai-oud-intense',
    title: 'Oud Elixir Dubai Oud Intense',
    brand: 'Oud Elixir',
    price: 65.0,
    compare_at_price: 85.0,
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    description: 'An opulent, regal blend of pure Cambodian oud, smokey incense, dark Bulgarian rose, and warm amber.',
    size: '100ml Extrait De Parfum',
    collections: 'new-in|best-sellers|oud-elixir|oud-1|extrait-de-parfum|evening-fragrances|unisex',
    in_stock: 1
  },
  {
    id: 2,
    handle: 'afnan-supremacy-in-heaven',
    title: 'Afnan Supremacy In Heaven',
    brand: 'Afnan',
    price: 45.0,
    compare_at_price: 55.0,
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'A crisp, exhilarating composition capturing the essence of fresh mountain air with citrus and green tea.',
    size: '100ml Eau De Parfum',
    collections: 'new-in|afnan|mens|everyday-fragrances|summer-fragrances',
    in_stock: 1
  },
  {
    id: 3,
    handle: 'swiss-arabian-shaghaf-oud',
    title: 'Swiss Arabian Shaghaf Oud',
    brand: 'Swiss Arabian',
    price: 39.5,
    compare_at_price: 49.0,
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    description: 'Sweet praline, velvety rose, and precious agarwood melting into golden vanilla and amber.',
    size: '75ml Eau De Parfum',
    collections: 'best-sellers|swiss-arabian|gourmand|oud-1|winter|unisex',
    in_stock: 1
  },
  {
    id: 4,
    handle: 'lattafa-khamrah',
    title: 'Lattafa Khamrah Luxury Edition',
    brand: 'Lattafa',
    price: 42.0,
    compare_at_price: 52.0,
    image_url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    description: 'Warm spicy masterpiece with sweet dates, cinnamon, roasted tonka bean, and creamy vanilla.',
    size: '100ml Eau De Parfum',
    collections: 'new-in|best-sellers|lattafa|gourmand|amber|evening-fragrances|unisex',
    in_stock: 1
  },
  {
    id: 5,
    handle: 'zimaya-sharaf-blend',
    title: 'Zimaya Sharaf Blend',
    brand: 'Zimaya',
    price: 36.0,
    compare_at_price: 45.0,
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'Indulgent, seductive notes of dates, cognac aroma, and spiced vanilla.',
    size: '100ml Extrait De Parfum',
    collections: 'zimaya|gourmand|amber|autumn|winter|unisex|new-in',
    in_stock: 1
  },
  {
    id: 6,
    handle: 'rayhaan-elixir-imperial',
    title: 'Rayhaan Elixir Imperial',
    brand: 'Rayhaan',
    price: 38.0,
    compare_at_price: 48.0,
    image_url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    description: 'An assertive masculine statement with aromatic lavender, fresh mint, and dark woods.',
    size: '100ml Eau De Parfum',
    collections: 'rayhaan|mens|everyday-fragrances|woody|spring-collection',
    in_stock: 1
  },
  {
    id: 7,
    handle: 'ajmal-amber-wood',
    title: 'Ajmal Amber Wood Signature Collection',
    brand: 'Ajmal',
    price: 89.0,
    compare_at_price: 110.0,
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    description: 'Crown jewel niche perfumery with white pepper, cardamom, cedarwood, and golden amber.',
    size: '100ml Eau De Parfum',
    collections: 'ajmal|amber|woody|evening-fragrances|unisex|best-sellers',
    in_stock: 1
  },
  {
    id: 8,
    handle: 'rasasi-hawas-for-him',
    title: 'Rasasi Hawas For Him',
    brand: 'Rasasi',
    price: 48.0,
    compare_at_price: 58.0,
    image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    description: 'The celebrated aquatic powerhouse. Fresh apple, cinnamon, citrus bergamot with aquatic marine accords.',
    size: '100ml Eau De Parfum',
    collections: 'best-sellers|rasasi|mens|summer-fragrances|everyday-fragrances|fruity-1',
    in_stock: 1
  },
  {
    id: 9,
    handle: 'blends-of-dubai-royal-bakhoor',
    title: 'Blends of Dubai Royal Bakhoor Extrait',
    brand: 'Blends of Dubai',
    price: 72.0,
    compare_at_price: 90.0,
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional Arabian majlis bakhoor. Frankincense, myrrh, smoky woods, and white amber.',
    size: '100ml Extrait De Parfum',
    collections: 'blends-of-dubai|extrait-de-parfum|oud-1|woody|evening-fragrances|unisex',
    in_stock: 1
  },
  {
    id: 10,
    handle: 'viali-velvet-musk',
    title: 'Viali Velvet Musk Oil',
    brand: 'Viali',
    price: 28.0,
    compare_at_price: 35.0,
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    description: 'Pure concentrated perfume oil (Attar). Velvety white musk, powdery iris, and lily of the valley.',
    size: '12ml Concentrated Perfume Oil',
    collections: 'viali|perfume-oils|womens|unisex|spring-collection',
    in_stock: 1
  },
  {
    id: 11,
    handle: 'gulf-orchid-rose-vanilla',
    title: 'Gulf Orchid Rose Vanilla',
    brand: 'Gulf Orchid',
    price: 34.0,
    compare_at_price: 42.0,
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    description: 'Delectable crystalline sugar roses and rich Madagascan vanilla bean.',
    size: '100ml Eau De Parfum',
    collections: 'gulf-orchid|womens|floral|gourmand|everyday-fragrances',
    in_stock: 1
  },
  {
    id: 12,
    handle: 'essential-perfume-oud-rose',
    title: 'Essential Perfume Oud & Damask Rose',
    brand: 'Essential Perfume',
    price: 52.0,
    compare_at_price: 65.0,
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    description: 'Damascus rose petals infused with rich agarwood oil and warm amber.',
    size: '100ml Eau De Parfum',
    collections: 'essential-perfume|floral|oud-1|womens|evening-fragrances',
    in_stock: 1
  },
  {
    id: 13,
    handle: 'oud-elixir-discovery-set',
    title: 'Oud Elixir Royal Discovery Collection (5 x 10ml Extrait)',
    brand: 'Oud Elixir',
    price: 55.0,
    compare_at_price: 75.0,
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'A lavish presentation box containing five 10ml travel flacons of Oud Elixir’s most prestigious extraits.',
    size: '5 x 10ml Luxury Discovery Set',
    collections: 'fragrance-sets|oud-elixir|new-in|best-sellers|unisex|oud-1|extrait-de-parfum',
    in_stock: 1
  },
  {
    id: 14,
    handle: 'afnan-supremacy-gift-set',
    title: 'Afnan Supremacy Silver Luxury Gift Set',
    brand: 'Afnan',
    price: 58.0,
    compare_at_price: 72.0,
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    description: 'Full-size 100ml Eau De Parfum and matching 150ml perfumed deodorant spray in an embossed collector box.',
    size: '100ml EDP + 150ml Deodorant Set',
    collections: 'fragrance-sets|afnan|mens|best-sellers|fruity-1|woody',
    in_stock: 1
  },
  {
    id: 15,
    handle: 'lattafa-khamrah-deodorant',
    title: 'Lattafa Khamrah Perfumed Deodorant Spray',
    brand: 'Lattafa',
    price: 14.0,
    compare_at_price: 18.0,
    image_url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    description: 'Rich, warming perfumed all-over deodorant spray echoing the sweet dates, cinnamon, and vanilla notes of Khamrah.',
    size: '200ml Luxury Deodorant Body Spray',
    collections: 'deodorants|lattafa|gourmand|unisex|new-in',
    in_stock: 1
  },
  {
    id: 16,
    handle: 'afnan-supremacy-deodorant',
    title: 'Afnan Supremacy Silver Perfumed Deodorant Spray',
    brand: 'Afnan',
    price: 14.0,
    compare_at_price: 18.0,
    image_url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    description: 'Invigorating all-day perfumed body spray featuring crisp birch, pineapple, and smoky woods for lasting freshness.',
    size: '200ml Luxury Deodorant Body Spray',
    collections: 'deodorants|afnan|mens|summer-fragrances|fruity-1',
    in_stock: 1
  },
  {
    id: 17,
    handle: 'blends-of-dubai-majlis-air-freshener',
    title: 'Blends of Dubai Royal Majlis Air Freshener',
    brand: 'Blends of Dubai',
    price: 16.0,
    compare_at_price: 22.0,
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'Transform your living space with the rich aromas of traditional Arabian bakhoor, frankincense, amber, and aged cedarwood.',
    size: '300ml Luxury Room & Linen Spray',
    collections: 'air-freshners|blends-of-dubai|oud-1|unisex',
    in_stock: 1
  },
  {
    id: 18,
    handle: 'lattafa-raghba-air-freshener',
    title: 'Lattafa Raghba Home & Linen Fragrance Mist',
    brand: 'Lattafa',
    price: 15.0,
    compare_at_price: 20.0,
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    description: 'Enchanting room mist infused with sweet vanilla, caramel, sandalwood, and soft incense.',
    size: '300ml Atmospheric Fragrance Mist',
    collections: 'air-freshners|lattafa|gourmand|unisex',
    in_stock: 1
  },
  {
    id: 19,
    handle: 'rue-broca-theoreme-pour-homme',
    title: 'Rue Broca Théorème Pour Homme',
    brand: 'Rue Broca',
    price: 35.0,
    compare_at_price: 45.0,
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    description: 'A sophisticated citrus-woody fragrance featuring sparkling grapefruit, spicy pink pepper, and rich ambroxan on a cedar base.',
    size: '90ml Eau De Parfum',
    collections: 'rue-broca|mens|everyday-fragrances|woody|summer-fragrances|fruity-1',
    in_stock: 1
  },
  {
    id: 20,
    handle: 'ard-al-zaafaran-shams-al-emarat',
    title: 'Ard Al Zaafaran Shams Al Emarat Khususi',
    brand: 'Ard Al Zaafaran',
    price: 32.0,
    compare_at_price: 42.0,
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    description: 'An alluring oriental gourmand accord opening with crisp apple and mandarin, leading to warm vanilla, rose, and ambergris.',
    size: '100ml Eau De Parfum',
    collections: 'ard-al-zaafaran|fruity-1|amber|unisex|best-sellers|gourmand',
    in_stock: 1
  },
  {
    id: 21,
    handle: 'ard-al-zaafaran-dirham-gold',
    title: 'Ard Al Zaafaran Dirham Gold',
    brand: 'Ard Al Zaafaran',
    price: 29.0,
    compare_at_price: 38.0,
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'Bright and opulent golden fragrance blending pineapple, bergamot, jasmine, and warm vanilla with sandalwood.',
    size: '100ml Eau De Parfum',
    collections: 'ard-al-zaafaran|fruity-1|floral|womens|everyday-fragrances|spring-collection',
    in_stock: 1
  },
  {
    id: 22,
    handle: 'viali-santal-blanc-last-chance',
    title: 'Viali Santal Blanc Rare Edition Flacon',
    brand: 'Viali',
    price: 39.0,
    compare_at_price: 65.0,
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'Final quantities of Viali’s coveted Santal Blanc. Creamy Australian sandalwood, white cardamom, and velvety iris.',
    size: '100ml Eau De Parfum',
    collections: 'last-chance|viali|woody|unisex|winter|autumn',
    in_stock: 1
  },
  {
    id: 23,
    handle: 'essential-perfume-rose-oud-travel',
    title: 'Essential Perfume Rose & Oud Travel Atomiser Set',
    brand: 'Essential Perfume',
    price: 44.0,
    compare_at_price: 58.0,
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'Three 15ml refillable travel atomisers housed in a leatherette pouch. High Extrait concentration of Damascus Rose & Oud.',
    size: '3 x 15ml Extrait De Parfum Set',
    collections: 'fragrance-sets|essential-perfume|last-chance|floral|womens|oud-1',
    in_stock: 1
  },
  {
    id: 24,
    handle: 'swiss-arabian-casablanca',
    title: 'Swiss Arabian Casablanca',
    brand: 'Swiss Arabian',
    price: 46.0,
    compare_at_price: 58.0,
    image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    description: 'A breathtaking unisex gourmand with juicy ripe grapes, crisp apple, caramel, patchouli, and sensual white amber.',
    size: '100ml Eau De Parfum',
    collections: 'swiss-arabian|fruity-1|gourmand|unisex|autumn|best-sellers',
    in_stock: 1
  }
];

const inMemoryOrders = readJsonFile(ORDERS_FILE, []);
const inMemoryUsers = readJsonFile(USERS_FILE, []);
const inMemorySubscribers = readJsonFile(SUBSCRIBERS_FILE, []);

function syncOrdersFile() {
  writeJsonFile(ORDERS_FILE, inMemoryOrders);
}
function syncUsersFile() {
  writeJsonFile(USERS_FILE, inMemoryUsers);
}
function syncSubscribersFile() {
  writeJsonFile(SUBSCRIBERS_FILE, inMemorySubscribers);
}

async function checkDbConnection() {
  if (isCheckingDb) return isDbConnected;
  isCheckingDb = true;
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    if (!isDbConnected) {
      const target = process.env.DATABASE_URL ? 'DATABASE_URL' : `${DB_CONFIG.database}@${DB_CONFIG.host}:${DB_CONFIG.port}`;
      console.log(`Connected to PostgreSQL database [${target}]`);
    }
    isDbConnected = true;
    return true;
  } catch (err) {
    if (isDbConnected) {
      console.warn('PostgreSQL connection lost:', err.message);
    }
    isDbConnected = false;
    return false;
  } finally {
    if (client) client.release();
    isCheckingDb = false;
  }
}

async function linkProductCollections(client, productId, collectionsInput) {
  const handles = String(collectionsInput || '')
    .split(/[|,]/)
    .map((h) => slugify(h))
    .filter(Boolean);

  for (const h of handles) {
    await client.query(
      `INSERT INTO collections (handle, title, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (handle) DO NOTHING`,
      [h, handleToTitle(h), `Discover our luxury selection of fragrances for ${handleToTitle(h)} at Perfume Zone UK.`]
    );
    await client.query(
      `INSERT INTO product_collections (product_id, collection_id)
       SELECT $1, id FROM collections WHERE handle = $2
       ON CONFLICT DO NOTHING`,
      [productId, h]
    );
  }
}

async function initDatabaseTables() {
  const connected = await checkDbConnection();
  if (!connected) {
    console.warn('PostgreSQL is unreachable. Server is operating in in-memory fallback mode.');
    return;
  }

  let client;
  try {
    client = await pool.connect();

    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id          SERIAL PRIMARY KEY,
        handle      VARCHAR(190) UNIQUE NOT NULL,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        image_url   VARCHAR(500),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_collections_handle ON collections(handle);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id               SERIAL PRIMARY KEY,
        handle           VARCHAR(190) UNIQUE NOT NULL,
        title            VARCHAR(255) NOT NULL,
        brand            VARCHAR(100),
        price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
        compare_at_price NUMERIC(10, 2) NULL CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
        image_url        VARCHAR(500),
        image_url_2      VARCHAR(500),
        description      TEXT,
        size             VARCHAR(100) DEFAULT '100ml Eau De Parfum',
        collections      TEXT,
        notes            JSONB NOT NULL DEFAULT '{}'::jsonb,
        in_stock         SMALLINT NOT NULL DEFAULT 1 CHECK (in_stock IN (0, 1)),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
      CREATE TRIGGER trg_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS product_collections (
        product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, collection_id)
      );
      CREATE INDEX IF NOT EXISTS idx_pc_collection_id ON product_collections(collection_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        name          VARCHAR(150),
        phone         VARCHAR(50),
        address       VARCHAR(255),
        apartment     VARCHAR(100),
        city          VARCHAR(100),
        postcode      VARCHAR(30),
        country       VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
        password_hash VARCHAR(255),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
      CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id              VARCHAR(50) PRIMARY KEY,
        user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
        email           VARCHAR(255) NOT NULL,
        customer_name   VARCHAR(150) NOT NULL,
        phone           VARCHAR(50),
        address         VARCHAR(255) NOT NULL,
        apartment       VARCHAR(100),
        city            VARCHAR(100) NOT NULL,
        postcode        VARCHAR(30) NOT NULL,
        country         VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
        subtotal        NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
        shipping_cost   NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_cost >= 0),
        discount        NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
        coupon_code     VARCHAR(50),
        total           NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
        shipping_method VARCHAR(100) NOT NULL DEFAULT 'standard',
        payment_method  VARCHAR(50) NOT NULL DEFAULT 'card',
        order_note      TEXT,
        status          VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
        items           JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
      CREATE TRIGGER trg_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id             SERIAL PRIMARY KEY,
        order_id       VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_handle VARCHAR(190),
        title          VARCHAR(255) NOT NULL,
        brand          VARCHAR(100),
        size           VARCHAR(100),
        unit_price     NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
        quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        line_total     NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
        image_url      VARCHAR(500)
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        source        VARCHAR(50) NOT NULL DEFAULT 'footer',
        status        VARCHAR(30) NOT NULL DEFAULT 'subscribed',
        subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(LOWER(email));
    `);

    const countRes = await client.query('SELECT COUNT(*)::int AS product_count FROM products');
    const productCount = countRes.rows[0]?.product_count || 0;

    if (productCount === 0) {
      console.log('PostgreSQL products table is empty. Seeding luxury collection...');
      for (const p of FALLBACK_PRODUCTS) {
        const ins = await client.query(
          `INSERT INTO products (
             handle, title, brand, price, compare_at_price,
             image_url, image_url_2, description, size, collections, in_stock
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (handle) DO UPDATE SET
             title = EXCLUDED.title,
             brand = EXCLUDED.brand,
             price = EXCLUDED.price,
             compare_at_price = EXCLUDED.compare_at_price,
             image_url = EXCLUDED.image_url,
             image_url_2 = EXCLUDED.image_url_2,
             description = EXCLUDED.description,
             size = EXCLUDED.size,
             collections = EXCLUDED.collections,
             in_stock = EXCLUDED.in_stock
           RETURNING id`,
          [
            p.handle,
            p.title,
            p.brand,
            p.price,
            p.compare_at_price || null,
            p.image_url,
            p.image_url_2 || null,
            p.description,
            p.size,
            p.collections,
            p.in_stock ?? 1
          ]
        );
        await linkProductCollections(client, ins.rows[0].id, p.collections);
      }
      console.log('Seeded products and collections successfully.');
    }

    console.log('PostgreSQL schema ready.');
  } catch (err) {
    console.warn('PostgreSQL initialization error:', err.message);
  } finally {
    if (client) client.release();
  }
}

initDatabaseTables();

setInterval(() => {
  checkDbConnection().catch(() => {});
}, 60000);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'unknown') });
  });

const SORTS = {
  manual: 'p.id ASC',
  'created-descending': 'p.created_at DESC, p.id DESC',
  'price-ascending': 'p.price ASC, p.id ASC',
  'price-descending': 'p.price DESC, p.id ASC',
  'title-ascending': 'p.title ASC',
  'title-descending': 'p.title DESC'
};

// Health & DB Status endpoint
app.get('/api/health', async (req, res) => {
  if (!isDbConnected) {
    await checkDbConnection();
  }
  res.json({
    status: 'ok',
    db: isDbConnected ? 'connected' : 'disconnected',
    engine: 'postgresql',
    mode: isDbConnected ? 'postgresql' : 'in-memory-fallback',
    host: DB_CONFIG.host || 'url',
    port: DB_CONFIG.port || 5432,
    database: DB_CONFIG.database || 'configured'
  });
});

// GET /api/products
app.get(
  '/api/products',
  wrap(async (req, res) => {
    const { collection, q, brand, sort = 'manual' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    if (isDbConnected) {
      try {
        const where = [];
        const params = [];

        if (collection && collection !== 'all') {
          params.push(collection.toLowerCase().trim());
          const idx = params.length;
          where.push(`(
            EXISTS (
              SELECT 1
              FROM product_collections pc
              JOIN collections c ON c.id = pc.collection_id
              WHERE pc.product_id = p.id AND LOWER(c.handle) = $${idx}
            )
            OR LOWER(REGEXP_REPLACE(COALESCE(p.brand, ''), '[^a-zA-Z0-9]+', '-', 'g')) = $${idx}
            OR ($${idx} = 'last-chance' AND p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price)
          )`);
        }

        if (brand) {
          params.push(brand.trim());
          where.push(`LOWER(COALESCE(p.brand, '')) = LOWER($${params.length})`);
        }

        if (q) {
          params.push(`%${q.trim()}%`);
          const idx = params.length;
          where.push(`(p.title ILIKE $${idx} OR COALESCE(p.brand, '') ILIKE $${idx} OR COALESCE(p.description, '') ILIKE $${idx})`);
        }

        const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
        const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM products p ${w}`, params);
        const total = countResult.rows[0]?.total || 0;

        const orderBy = SORTS[sort] || SORTS.manual;
        const offset = (page - 1) * limit;
        const listParams = [...params, limit, offset];
        const rowsResult = await pool.query(
          `SELECT p.* FROM products p ${w} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          listParams
        );

        return res.json({
          products: rowsResult.rows.map(formatProduct),
          total,
          page,
          pages: Math.max(1, Math.ceil(total / limit))
        });
      } catch (dbErr) {
        console.warn('PostgreSQL product query failed, using in-memory fallback:', dbErr.message);
        isDbConnected = false;
      }
    }

    // Fast in-memory fallback
    let list = [...FALLBACK_PRODUCTS];
    if (collection && collection !== 'all') {
      const target = collection.toLowerCase().trim();
      list = list.filter((p) => {
        const cols = (p.collections || '').toLowerCase().split('|').map((s) => s.trim());
        if (cols.includes(target)) return true;
        if (target === 'unisex' && (cols.includes('unisex') || (!cols.includes('mens') && !cols.includes('womens')))) return true;
        if (target === 'best-sellers' && (cols.includes('best-sellers') || p.price > 40)) return true;
        if (target === 'new-in' && (cols.includes('new-in') || p.id <= 8)) return true;
        if (target === 'last-chance' && (cols.includes('last-chance') || (p.compare_at_price && p.compare_at_price > p.price))) return true;
        if (p.brand && slugify(p.brand) === target) return true;
        return false;
      });
    }

    if (brand) {
      list = list.filter((p) => (p.brand || '').toLowerCase() === brand.toLowerCase());
    }

    if (q) {
      const query = q.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(query) ||
          (p.brand || '').toLowerCase().includes(query) ||
          (p.description || '').toLowerCase().includes(query)
      );
    }

    if (sort === 'price-ascending') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-descending') list.sort((a, b) => b.price - a.price);
    else if (sort === 'title-ascending') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (sort === 'title-descending') list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    else if (sort === 'created-descending') list.sort((a, b) => (b.id || 0) - (a.id || 0));

    const total = list.length;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit).map(formatProduct);

    res.json({ products: paginated, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  })
);

// GET /api/products/:handle
app.get(
  '/api/products/:handle',
  wrap(async (req, res) => {
    if (isDbConnected) {
      try {
        const result = await pool.query('SELECT * FROM products WHERE handle = $1', [req.params.handle]);
        if (result.rows[0]) return res.json(formatProduct(result.rows[0]));
      } catch (err) {
        console.warn('PostgreSQL product lookup error:', err.message);
        isDbConnected = false;
      }
    }

    const found = FALLBACK_PRODUCTS.find((p) => p.handle === req.params.handle);
    if (found) return res.json(formatProduct(found));
    res.status(404).json({ error: 'Product not found' });
  })
);

// GET /api/collections
app.get(
  '/api/collections',
  wrap(async (req, res) => {
    if (isDbConnected) {
      try {
        const result = await pool.query('SELECT id, handle, title, description, image_url FROM collections ORDER BY id ASC');
        return res.json({ collections: result.rows });
      } catch (err) {
        console.warn('PostgreSQL collections query error:', err.message);
        isDbConnected = false;
      }
    }

    const handles = new Set();
    FALLBACK_PRODUCTS.forEach((p) => {
      String(p.collections || '')
        .split('|')
        .filter(Boolean)
        .forEach((h) => handles.add(h.trim()));
    });
    res.json({
      collections: Array.from(handles).map((h, i) => ({
        id: i + 1,
        handle: h,
        title: handleToTitle(h),
        description: `Discover our exclusive selection of luxury fragrances for ${handleToTitle(h)} at Perfume Zone UK.`
      }))
    });
  })
);

// GET /api/collections/:handle
app.get(
  '/api/collections/:handle',
  wrap(async (req, res) => {
    const handle = req.params.handle || 'all';
    if (isDbConnected && handle !== 'all') {
      try {
        const result = await pool.query('SELECT * FROM collections WHERE handle = $1', [handle]);
        if (result.rows[0]) return res.json(result.rows[0]);
      } catch (err) {
        console.warn('PostgreSQL collection lookup error:', err.message);
        isDbConnected = false;
      }
    }

    const title = handleToTitle(handle);
    res.json({
      handle,
      title: handle === 'all' ? 'All Fragrances' : title,
      description: `Discover our exclusive selection of luxury fragrances for ${handle === 'all' ? 'All Fragrances' : title} at Perfume Zone UK.`
    });
  })
);

// POST /api/import
app.post(
  '/api/import',
  wrap(async (req, res) => {
    const products = req.body.products || [];
    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ error: 'No products provided' });
    }

    if (isDbConnected) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        let count = 0;

        for (const r of products) {
          if (!r.title || !r.handle) continue;
          const cleanHandle = slugify(r.handle) || r.handle;
          const collectionsText = Array.isArray(r.collections)
            ? r.collections.join('|')
            : String(r.collections || 'new-in');
          const notesObj = r.notes && typeof r.notes === 'object' ? r.notes : {};

          const upsert = await client.query(
            `INSERT INTO products (
               handle, title, brand, price, compare_at_price,
               image_url, image_url_2, description, size, collections, notes, in_stock
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12)
             ON CONFLICT (handle) DO UPDATE SET
               title = EXCLUDED.title,
               brand = EXCLUDED.brand,
               price = EXCLUDED.price,
               compare_at_price = EXCLUDED.compare_at_price,
               image_url = EXCLUDED.image_url,
               image_url_2 = EXCLUDED.image_url_2,
               description = EXCLUDED.description,
               size = EXCLUDED.size,
               collections = EXCLUDED.collections,
               notes = EXCLUDED.notes,
               in_stock = EXCLUDED.in_stock
             RETURNING id`,
            [
              cleanHandle,
              r.title,
              r.brand || 'Perfume Zone',
              Number(r.price || 0),
              r.compare_at_price ? Number(r.compare_at_price) : null,
              r.image_url || '',
              r.image_url_2 || '',
              r.description || '',
              r.size || '100ml Eau De Parfum',
              collectionsText,
              JSON.stringify(notesObj),
              r.in_stock === 0 ? 0 : 1
            ]
          );

          await linkProductCollections(client, upsert.rows[0].id, collectionsText);
          count++;
        }

        await client.query('COMMIT');
        return res.json({ ok: true, imported: count, storage: 'postgresql' });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.warn('PostgreSQL import failed, storing in memory:', err.message);
        isDbConnected = false;
      } finally {
        client.release();
      }
    }

    // Fallback import in-memory
    let count = 0;
    for (const r of products) {
      if (!r.handle || !r.title) continue;
      const idx = FALLBACK_PRODUCTS.findIndex((p) => p.handle === r.handle);
      if (idx >= 0) FALLBACK_PRODUCTS[idx] = { ...FALLBACK_PRODUCTS[idx], ...r };
      else FALLBACK_PRODUCTS.push({ id: FALLBACK_PRODUCTS.length + 1, ...r });
      count++;
    }

    res.json({ ok: true, imported: count, storage: 'in-memory' });
  })
);

// POST /api/orders
app.post(
  '/api/orders',
  wrap(async (req, res) => {
    const {
      id = 'PZ-' + Math.floor(100000 + Math.random() * 900000),
      email,
      customerName,
      shippingAddress = {},
      subtotal = 0,
      shippingCost = 0,
      discount = 0,
      couponCode = null,
      total = 0,
      shippingMethod = 'standard',
      paymentMethod = 'card',
      orderNote = null,
      trackingNumber = '',
      courier = 'Royal Mail Tracked',
      adminNote = '',
      status = 'Confirmed',
      items = [],
      newsletter = false
    } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return res.status(400).json({ error: 'Valid customer email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const resolvedName =
      (customerName && String(customerName).trim()) ||
      `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() ||
      'Perfume Zone Customer';

    const cleanItems = (Array.isArray(items) ? items : []).map((item) => ({
      id: item.id || null,
      handle: item.handle || null,
      title: String(item.title || 'Luxury Fragrance'),
      brand: item.brand || '',
      size: item.size || '100ml',
      price: Number(item.price || 0),
      qty: Math.max(1, Number(item.qty || 1)),
      image: item.image || item.image_url || ''
    }));

    const normalizedOrder = {
      id,
      userId: req.body.userId || null,
      email: cleanEmail,
      customerName: resolvedName,
      shippingAddress: {
        firstName: shippingAddress.firstName || '',
        lastName: shippingAddress.lastName || '',
        address: shippingAddress.address || '',
        apartment: shippingAddress.apartment || '',
        city: shippingAddress.city || '',
        postcode: shippingAddress.postcode || '',
        country: shippingAddress.country || 'United Kingdom',
        phone: shippingAddress.phone || ''
      },
      items: cleanItems,
      shippingMethod: shippingMethod || 'standard',
      shippingCost: Number(shippingCost || 0),
      subtotal: Number(subtotal || 0),
      discount: Number(discount || 0),
      couponCode: couponCode || null,
      total: Number(total || 0),
      paymentMethod: paymentMethod || 'card',
      orderNote: orderNote || null,
      trackingNumber: trackingNumber || '',
      courier: courier || 'Royal Mail Tracked',
      adminNote: adminNote || '',
      status,
      createdAt: new Date().toISOString()
    };

    // Always persist order to server/data/orders.json
    const existingIdx = inMemoryOrders.findIndex((o) => o.id === id);
    if (existingIdx >= 0) inMemoryOrders[existingIdx] = normalizedOrder;
    else inMemoryOrders.unshift(normalizedOrder);
    syncOrdersFile();

    if (newsletter && !inMemorySubscribers.some((s) => s.email === cleanEmail)) {
      inMemorySubscribers.push({
        email: cleanEmail,
        source: 'checkout',
        status: 'subscribed',
        subscribed_at: new Date().toISOString()
      });
      syncSubscribersFile();
    }

    if (isDbConnected) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Upsert customer in users table
        const userRes = await client.query(
          `INSERT INTO users (email, name, phone, address, apartment, city, postcode, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (email) DO UPDATE SET
             name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
             phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone),
             address = COALESCE(NULLIF(EXCLUDED.address, ''), users.address),
             apartment = COALESCE(NULLIF(EXCLUDED.apartment, ''), users.apartment),
             city = COALESCE(NULLIF(EXCLUDED.city, ''), users.city),
             postcode = COALESCE(NULLIF(EXCLUDED.postcode, ''), users.postcode),
             country = COALESCE(NULLIF(EXCLUDED.country, ''), users.country)
           RETURNING id`,
          [
            cleanEmail,
            resolvedName,
            shippingAddress.phone || null,
            shippingAddress.address || null,
            shippingAddress.apartment || null,
            shippingAddress.city || null,
            shippingAddress.postcode || null,
            shippingAddress.country || 'United Kingdom'
          ]
        );
        const userId = userRes.rows[0].id;

        // Insert order row
        const orderRes = await client.query(
          `INSERT INTO orders (
             id, user_id, email, customer_name, phone, address, apartment,
             city, postcode, country, subtotal, shipping_cost, discount,
             coupon_code, total, shipping_method, payment_method, order_note, status, items
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb)
           RETURNING *`,
          [
            id,
            userId,
            cleanEmail,
            resolvedName,
            shippingAddress.phone || null,
            shippingAddress.address || '',
            shippingAddress.apartment || null,
            shippingAddress.city || '',
            shippingAddress.postcode || '',
            shippingAddress.country || 'United Kingdom',
            Number(subtotal || 0),
            Number(shippingCost || 0),
            Number(discount || 0),
            couponCode || null,
            Number(total || 0),
            shippingMethod || 'standard',
            paymentMethod || 'card',
            orderNote || null,
            status,
            JSON.stringify(cleanItems)
          ]
        );

        // Insert relational order_items
        for (const item of cleanItems) {
          let productId = null;
          if (item.handle) {
            const pRes = await client.query('SELECT id FROM products WHERE handle = $1', [item.handle]);
            if (pRes.rows[0]) productId = pRes.rows[0].id;
          } else if (Number.isInteger(Number(item.id))) {
            const pRes = await client.query('SELECT id FROM products WHERE id = $1', [Number(item.id)]);
            if (pRes.rows[0]) productId = pRes.rows[0].id;
          }

          await client.query(
            `INSERT INTO order_items (
               order_id, product_id, product_handle, title, brand, size,
               unit_price, quantity, line_total, image_url
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              id,
              productId,
              item.handle,
              item.title,
              item.brand || null,
              item.size || null,
              item.price,
              item.qty,
              Number((item.price * item.qty).toFixed(2)),
              item.image || null
            ]
          );
        }

        // Save subscriber if opted in during checkout
        if (newsletter) {
          await client.query(
            `INSERT INTO subscribers (email, source, status)
             VALUES ($1, 'checkout', 'subscribed')
             ON CONFLICT (email) DO UPDATE SET status = 'subscribed'`,
            [cleanEmail]
          );
        }

        await client.query('COMMIT');
        return res.status(201).json({
          ok: true,
          id,
          userId,
          storage: 'postgresql',
          order: formatOrder(orderRes.rows[0])
        });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.warn('PostgreSQL order insert failed, using in-memory fallback:', err.message);
        isDbConnected = false;
      } finally {
        client.release();
      }
    }

    res.status(201).json({
      ok: true,
      id,
      userId: 1,
      storage: 'file-json',
      order: formatOrder(normalizedOrder)
    });
  })
);

// GET /api/orders (All orders for Admin Dashboard)
app.get(
  '/api/orders',
  wrap(async (req, res) => {
    if (isDbConnected) {
      try {
        const ordersRes = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
        return res.json({ orders: ordersRes.rows.map((r) => formatOrder(r)), storage: 'postgresql' });
      } catch (err) {
        console.warn('PostgreSQL orders list failed:', err.message);
        isDbConnected = false;
      }
    }
    res.json({ orders: inMemoryOrders.map((r) => formatOrder(r)), storage: 'file-json' });
  })
);

// GET /api/orders/:id
app.get(
  '/api/orders/:id',
  wrap(async (req, res) => {
    if (isDbConnected) {
      try {
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (orderRes.rows[0]) {
          const itemsRes = await pool.query(
            'SELECT product_id, product_handle, title, brand, size, unit_price, quantity, image_url FROM order_items WHERE order_id = $1 ORDER BY id ASC',
            [req.params.id]
          );
          return res.json(formatOrder(orderRes.rows[0], itemsRes.rows));
        }
      } catch (err) {
        console.warn('PostgreSQL order lookup failed:', err.message);
        isDbConnected = false;
      }
    }

    const found = inMemoryOrders.find(
      (o) => String(o.id || '').toUpperCase() === String(req.params.id || '').toUpperCase()
    );
    if (found) return res.json(formatOrder(found));
    res.status(404).json({ error: 'Order not found' });
  })
);

// PATCH /api/orders/:id (Update status, trackingNumber, courier, adminNote)
app.patch(
  '/api/orders/:id',
  wrap(async (req, res) => {
    const orderId = String(req.params.id || '').trim();
    const { status, trackingNumber, courier, adminNote } = req.body || {};

    const idx = inMemoryOrders.findIndex(
      (o) => String(o.id || '').toUpperCase() === orderId.toUpperCase()
    );
    if (idx >= 0) {
      inMemoryOrders[idx] = {
        ...inMemoryOrders[idx],
        ...(status !== undefined ? { status } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(courier !== undefined ? { courier } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
        updatedAt: new Date().toISOString()
      };
      syncOrdersFile();
    }

    if (isDbConnected) {
      try {
        await pool.query(
          `UPDATE orders SET
             status = COALESCE($2, status)
           WHERE id = $1`,
          [orderId, status ?? null]
        );
      } catch (err) {
        console.warn('PostgreSQL order update failed:', err.message);
      }
    }

    if (idx >= 0) {
      return res.json({ ok: true, order: formatOrder(inMemoryOrders[idx]) });
    }
    res.status(404).json({ error: 'Order not found' });
  })
);

// DELETE /api/orders/:id
app.delete(
  '/api/orders/:id',
  wrap(async (req, res) => {
    const orderId = String(req.params.id || '').trim();
    const idx = inMemoryOrders.findIndex(
      (o) => String(o.id || '').toUpperCase() === orderId.toUpperCase()
    );
    if (idx >= 0) {
      inMemoryOrders.splice(idx, 1);
      syncOrdersFile();
    }

    if (isDbConnected) {
      try {
        await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
      } catch {}
    }

    res.json({ ok: true });
  })
);

// GET /api/users (Read registered & seeded users from server/data/users.json)
app.get(
  '/api/users',
  wrap(async (req, res) => {
    res.json({ users: inMemoryUsers, storage: 'file-json' });
  })
);

// POST /api/users (Register or update user in server/data/users.json & PostgreSQL)
app.post(
  '/api/users',
  wrap(async (req, res) => {
    const incoming = req.body || {};
    const cleanEmail = String(incoming.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const existingIdx = inMemoryUsers.findIndex(
      (u) => String(u.email || '').toLowerCase() === cleanEmail
    );
    const mergedUser =
      existingIdx >= 0
        ? {
            ...inMemoryUsers[existingIdx],
            ...incoming,
            email: cleanEmail,
            password: incoming.password || inMemoryUsers[existingIdx].password
          }
        : {
            id: incoming.id || Date.now(),
            name: String(incoming.name || 'Customer').trim(),
            email: cleanEmail,
            password: incoming.password || '',
            role: incoming.role === 'admin' ? 'admin' : 'customer',
            phone: incoming.phone || '',
            address: incoming.address || '',
            apartment: incoming.apartment || '',
            city: incoming.city || '',
            postcode: incoming.postcode || '',
            country: incoming.country || 'United Kingdom',
            joinedDate:
              incoming.joinedDate ||
              new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
          };

    if (existingIdx >= 0) inMemoryUsers[existingIdx] = mergedUser;
    else inMemoryUsers.push(mergedUser);
    syncUsersFile();

    if (isDbConnected) {
      try {
        await pool.query(
          `INSERT INTO users (email, name, phone, address, apartment, city, postcode, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (email) DO UPDATE SET
             name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
             phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone),
             address = COALESCE(NULLIF(EXCLUDED.address, ''), users.address),
             apartment = COALESCE(NULLIF(EXCLUDED.apartment, ''), users.apartment),
             city = COALESCE(NULLIF(EXCLUDED.city, ''), users.city),
             postcode = COALESCE(NULLIF(EXCLUDED.postcode, ''), users.postcode),
             country = COALESCE(NULLIF(EXCLUDED.country, ''), users.country)`,
          [
            mergedUser.email,
            mergedUser.name,
            mergedUser.phone || null,
            mergedUser.address || null,
            mergedUser.apartment || null,
            mergedUser.city || null,
            mergedUser.postcode || null,
            mergedUser.country || 'United Kingdom'
          ]
        );
      } catch (err) {
        console.warn('PostgreSQL user upsert failed:', err.message);
      }
    }

    res.status(201).json({ ok: true, user: mergedUser, storage: 'file-json' });
  })
);

// DELETE /api/users/:email
app.delete(
  '/api/users/:email',
  wrap(async (req, res) => {
    const cleanEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
    const idx = inMemoryUsers.findIndex((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (idx >= 0) {
      inMemoryUsers.splice(idx, 1);
      syncUsersFile();
    }
    res.json({ ok: true });
  })
);

// GET /api/users/orders
app.get(
  '/api/users/orders',
  wrap(async (req, res) => {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email parameter required' });

    if (isDbConnected) {
      try {
        const ordersRes = await pool.query(
          'SELECT * FROM orders WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC',
          [email]
        );
        return res.json({ orders: ordersRes.rows.map((r) => formatOrder(r)) });
      } catch (err) {
        console.warn('PostgreSQL user orders query failed:', err.message);
        isDbConnected = false;
      }
    }

    const matched = inMemoryOrders
      .filter((o) => (o.email || '').toLowerCase() === email)
      .map((r) => formatOrder(r));
    res.json({ orders: matched });
  })
);

// POST /api/newsletter
app.post(
  '/api/newsletter',
  wrap(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const source = String(req.body.source || 'footer').trim().slice(0, 50) || 'footer';
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (!inMemorySubscribers.some((s) => s.email === email)) {
      inMemorySubscribers.push({
        email,
        source,
        status: 'subscribed',
        subscribed_at: new Date().toISOString()
      });
      syncSubscribersFile();
    }

    if (isDbConnected) {
      try {
        const subRes = await pool.query(
          `INSERT INTO subscribers (email, source, status)
           VALUES ($1, $2, 'subscribed')
           ON CONFLICT (email) DO UPDATE SET
             status = 'subscribed',
             source = EXCLUDED.source
           RETURNING id, email, source, status, subscribed_at`,
          [email, source]
        );
        return res.json({ ok: true, subscriber: subRes.rows[0], storage: 'postgresql' });
      } catch (err) {
        console.warn('PostgreSQL newsletter insert failed:', err.message);
        isDbConnected = false;
      }
    }

    res.json({ ok: true, storage: 'file-json' });
  })
);

// DELETE /api/newsletter/:email
app.delete(
  '/api/newsletter/:email',
  wrap(async (req, res) => {
    const cleanEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
    const idx = inMemorySubscribers.findIndex((s) => (s.email || '').toLowerCase() === cleanEmail);
    if (idx >= 0) {
      inMemorySubscribers.splice(idx, 1);
      syncSubscribersFile();
    }
    res.json({ ok: true });
  })
);

// GET /api/subscribers
app.get(
  '/api/subscribers',
  wrap(async (req, res) => {
    if (isDbConnected) {
      try {
        const result = await pool.query(
          'SELECT id, email, source, status, subscribed_at FROM subscribers ORDER BY subscribed_at DESC LIMIT 100'
        );
        return res.json({ count: result.rows.length, subscribers: result.rows });
      } catch (err) {
        console.warn('PostgreSQL subscribers query failed:', err.message);
        isDbConnected = false;
      }
    }

    res.json({ count: inMemorySubscribers.length, subscribers: inMemorySubscribers });
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Perfume Zone API running on port ' + PORT));
