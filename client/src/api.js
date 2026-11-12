import { INITIAL_PRODUCTS } from './data/products.js';
import { INITIAL_BLOGS } from './data/blogs.js';

// Track backend API availability to avoid repeated slow hangs
let apiOnline = null; // null = untried, true = online, false = offline
let lastHealthCheck = 0;

export const COLLECTION_META = {
  'all': {
    title: 'All Fragrances',
    description: 'Explore our complete library of authentic luxury Arabian perfumes, rare Oud, and artisan extraits at Perfume Zone UK.'
  },
  'new-in': {
    title: 'New In & Latest Releases',
    description: 'The freshest creations and new season arrivals from the prestigious perfume houses of Dubai and Europe.'
  },
  'best-sellers': {
    title: 'Best Sellers Collection',
    description: 'Our most coveted and acclaimed signature perfumes, loved by fragrance connoisseurs across the UK.'
  },
  'fragrance-sets': {
    title: 'Fragrance Discovery & Gift Sets',
    description: 'Curated luxury discovery sets, travel atomisers, and bespoke gift presentations.'
  },
  'last-chance': {
    title: 'Last Chance & Limited Reductions',
    description: 'Rare flacons and final quantities of limited edition luxury extraits at special pricing.'
  },
  'womens': {
    title: "Women's Fragrances",
    description: 'Sensual floral, gourmand vanilla, sweet fruits, and delicate musks crafted for her.'
  },
  'mens': {
    title: "Men's Fragrances",
    description: 'Assertive woody, smoky oud, fresh citrus, and spicy leathers crafted for him.'
  },
  'unisex': {
    title: 'Unisex Fragrances',
    description: 'Captivating compositions that transcend boundaries—amber, agarwood, tonka bean, and spiced florals.'
  },
  'extrait-de-parfum': {
    title: 'Extrait De Parfum (Pure Perfume)',
    description: 'The highest concentration in high perfumery (25%–40% oil) for unrivaled 16-hour sillage.'
  },
  'perfume-oils': {
    title: 'Concentrated Perfume Oils (Attar)',
    description: 'Alcohol-free, pure artisan perfume oils crafted for direct pulse point application.'
  },
  'deodorants': {
    title: 'Luxury Perfumed Deodorants',
    description: 'Long-lasting scented body sprays infused with genuine Arabian perfume notes.'
  },
  'air-freshners': {
    title: 'Air & Room Fresheners (Home & Linen)',
    description: 'Luxury Arabian room sprays and atmospheric mists to scent your living spaces.'
  },
  'oud-1': {
    title: 'Precious Oud & Agarwood',
    description: 'Rich, smokey Cambodian, Indian, and Arabian agarwoods blended with rose and amber.'
  },
  'amber': {
    title: 'Warm & Golden Amber',
    description: 'Resinous, warm, and radiant amber accords with hints of sweet vanilla and balsam.'
  },
  'gourmand': {
    title: 'Sweet Gourmand Accords',
    description: 'Decadent blends of roasted praline, dates, vanilla bean, cinnamon, and creamy tonka.'
  },
  'woody': {
    title: 'Noble Woods & Vetiver',
    description: 'Earthy cedarwood, sandalwood, vetiver, and smoky frankincense.'
  },
  'fruity-1': {
    title: 'Fruity & Citrus Accords',
    description: 'Lively bergamot, fresh apple, ripe plum, and vibrant citrus nuances.'
  },
  'floral': {
    title: 'Sensual Floral Bouquets',
    description: 'Taif rose, velvet jasmine, white iris, and exotic lilies from Grasse and the East.'
  },
  'summer-fragrances': {
    title: 'Summer Fragrance Wardrobe',
    description: 'Crisp, aquatic, sparkling citrus and airy green tea scents for sunlit days.'
  },
  'spring-collection': {
    title: 'Spring Collection Wardrobe',
    description: 'Dewy petals, soft white musks, and uplifting floral-woody harmonies.'
  },
  'autumn': {
    title: 'Autumn Fragrance Wardrobe',
    description: 'Cozy spices, golden amber, roasted nuts, and warm balsamic undertones.'
  },
  'winter': {
    title: 'Winter Fragrance Wardrobe',
    description: 'Deep, enveloping oud, dark roses, sweet vanilla, and intoxicating boozy accords.'
  },
  'everyday-fragrances': {
    title: 'Everyday Fragrances',
    description: 'Versatile, refined scents designed for professional elegance and daily wear.'
  },
  'evening-fragrances': {
    title: 'Evening & Special Occasion Fragrances',
    description: 'Opulent, memorable scents formulated to make an indelible impression after dusk.'
  },
  'oud-elixir': {
    title: 'Oud Elixir Dubai',
    description: 'Royal bespoke extraits formulated with pure aged agarwood oils and regal resins.'
  },
  'essential-perfume': {
    title: 'Essential Perfume Paris & Dubai',
    description: 'Artisanal high-concentration compositions honoring classical perfumery traditions.'
  },
  'blends-of-dubai': {
    title: 'Blends of Dubai',
    description: 'Evocative scents inspired by the majestic dunes and opulent souks of Dubai.'
  },
  'viali': {
    title: 'Viali Milano & London',
    description: 'Ultra-concentrated perfume oils and modern niche extraits crafted for understated luxury.'
  },
  'afnan': {
    title: 'Afnan Perfumes',
    description: 'Masters of contemporary luxury, unmatched sillage, and viral modern sensations.'
  },
  'rayhaan': {
    title: 'Rayhaan Fragrances',
    description: 'Bold, masculine, and sophisticated fragrances crafted for modern leaders.'
  },
  'swiss-arabian': {
    title: 'Swiss Arabian',
    description: 'Heritage perfumery dating back to 1974, harmonizing European finesse with Arabian soul.'
  },
  'gulf-orchid': {
    title: 'Gulf Orchid Perfumery',
    description: 'Sweet, gourmand, and floral creations celebrating royal Arabian hospitality.'
  },
  'zimaya': {
    title: 'Zimaya Parfums',
    description: 'Niche-quality Extrait creations capturing rare accords and captivating drydowns.'
  },
  'rue-broca': {
    title: 'Rue Broca Paris',
    description: 'French refinement meets oriental richness in distinctively packaged bottles.'
  },
  'lattafa': {
    title: 'Lattafa Luxury Perfumes',
    description: 'Trendsetting creators of world-famous oriental scents including Khamrah and Yara.'
  },
  'ajmal': {
    title: 'Ajmal Perfumes',
    description: 'Over 70 years of legendary oud mastery, royal attars, and niche compositions.'
  },
  'rasasi': {
    title: 'Rasasi Perfumes',
    description: 'Celebrated worldwide for iconic fragrances including Hawas, Shuhrah, and La Yuqawam.'
  },
  'ard-al-zaafaran': {
    title: 'Ard Al Zaafaran',
    description: 'Prestigious Arabian creations famed for exquisite floral-amber bouquets.'
  }
};

const get = async (u, timeoutMs = 1500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(u, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    apiOnline = true;
    lastHealthCheck = Date.now();
    return await r.json();
  } catch (err) {
    clearTimeout(timer);
    apiOnline = false;
    lastHealthCheck = Date.now();
    throw err;
  }
};

const shouldTryApi = () => apiOnline !== false || Date.now() - lastHealthCheck > 15000;

const CUSTOM_PRODUCTS_KEY = 'perfumezone_custom_products';
const DELETED_PRODUCTS_KEY = 'perfumezone_deleted_products';
const ORDERS_KEY = 'perfumezone_orders';
const ORDERS_INIT_KEY = 'perfumezone_orders_init';
const BLOGS_KEY = 'perfumezone_blogs';
const SUBSCRIBERS_KEY = 'perfumezone_subscribers';
const SUBSCRIBERS_INIT_KEY = 'perfumezone_subscribers_init';
const SITE_SETTINGS_KEY = 'perfumezone_site_settings';

export const getCustomProducts = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY)) || [];
  } catch {
    return [];
  }
};

export const getDeletedProductHandles = () => {
  try {
    return JSON.parse(localStorage.getItem(DELETED_PRODUCTS_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveImportedProducts = (newProducts, replaceAll = false) => {
  try {
    const existing = replaceAll ? [] : getCustomProducts();
    const existingHandles = new Set(existing.map((p) => p.handle));
    const merged = [...existing];
    for (const p of newProducts) {
      if (existingHandles.has(p.handle)) {
        const idx = merged.findIndex((m) => m.handle === p.handle);
        merged[idx] = { ...merged[idx], ...p };
      } else {
        merged.push(p);
      }
    }
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(merged));

    // Unhide any handles that were previously deleted
    const importedHandles = new Set(newProducts.map((p) => p.handle));
    const nextDeleted = getDeletedProductHandles().filter((h) => !importedHandles.has(h));
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(nextDeleted));

    window.dispatchEvent(new Event('pz:products-change'));

    // Background sync to API if available
    fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: newProducts }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
    }).catch(() => {});

    return merged;
  } catch (err) {
    console.error('Failed to save imported products', err);
    return [];
  }
};

export const saveProductAdmin = (product) => {
  const cleanHandle =
    String(product.handle || '')
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    String(product.title || '')
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    'product-' + Date.now();

  const normalized = {
    id: product.id || Date.now(),
    handle: cleanHandle,
    title: String(product.title || 'Untitled Fragrance').trim(),
    brand: String(product.brand || 'Perfume Zone').trim(),
    price: Number(product.price || 0),
    compare_at_price:
      product.compare_at_price !== '' && product.compare_at_price != null
        ? Number(product.compare_at_price)
        : null,
    image_url:
      String(product.image_url || '').trim() ||
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    image_url_2: String(product.image_url_2 || '').trim() || '',
    description: String(product.description || '').trim(),
    size: String(product.size || '100ml Eau De Parfum').trim(),
    collections: String(product.collections || 'new-in|all').trim(),
    notes: product.notes || { top: '', middle: '', base: '' },
    in_stock: product.in_stock === 0 || product.in_stock === false ? 0 : 1
  };

  saveImportedProducts([normalized], false);
  return normalized;
};

export const deleteProductAdmin = (handle) => {
  try {
    const custom = getCustomProducts().filter((p) => p.handle !== handle);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));

    const deleted = new Set(getDeletedProductHandles());
    deleted.add(handle);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify([...deleted]));
    window.dispatchEvent(new Event('pz:products-change'));
  } catch (err) {
    console.error('Failed to delete product', err);
  }
};

export const clearCustomProducts = () => {
  localStorage.removeItem(CUSTOM_PRODUCTS_KEY);
  localStorage.removeItem(DELETED_PRODUCTS_KEY);
  window.dispatchEvent(new Event('pz:products-change'));
};

export const getAllLocalProducts = () => {
  const custom = getCustomProducts();
  const deleted = new Set(getDeletedProductHandles());
  const customHandles = new Set(custom.map((p) => p.handle));
  const base = INITIAL_PRODUCTS.filter((p) => !customHandles.has(p.handle) && !deleted.has(p.handle));
  return [...custom.filter((p) => !deleted.has(p.handle)), ...base];
};

const hasLocalCatalogEdits = () =>
  getCustomProducts().length > 0 || getDeletedProductHandles().length > 0;

export const getProducts = async (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));

  // Attempt API query when no unsynced local CMS deletions/overrides take precedence
  if (shouldTryApi() && !hasLocalCatalogEdits()) {
    try {
      const res = await get('/api/products?' + qs.toString(), 2000);
      if (res && Array.isArray(res.products)) {
        return res;
      }
    } catch {
      // Switch to local catalog without delay
    }
  }

  // Instant local fallback with comprehensive filtering & sorting
  let list = getAllLocalProducts();
  const { collection, q, brand, sort = 'manual', page = 1, limit = 24 } = params;

  if (collection && collection !== 'all') {
    const target = collection.toLowerCase().trim();
    list = list.filter((p) => {
      const cols = (p.collections || '').toLowerCase().split('|').map((s) => s.trim());
      if (cols.includes(target)) return true;
      if (target === 'mens' && cols.includes('mens')) return true;
      if (target === 'womens' && cols.includes('womens')) return true;
      if (target === 'unisex' && (cols.includes('unisex') || (!cols.includes('mens') && !cols.includes('womens')))) return true;
      if (target === 'best-sellers' && (cols.includes('best-sellers') || p.price > 40)) return true;
      if (target === 'new-in' && (cols.includes('new-in') || p.id <= 8)) return true;
      if (target === 'last-chance' && (cols.includes('last-chance') || (p.compare_at_price && p.compare_at_price > p.price))) return true;
      if (target === 'fragrance-sets' && cols.includes('fragrance-sets')) return true;
      if (target === 'deodorants' && cols.includes('deodorants')) return true;
      if (target === 'air-freshners' && cols.includes('air-freshners')) return true;
      if (target === 'perfume-oils' && cols.includes('perfume-oils')) return true;
      if (p.brand && p.brand.toLowerCase().replace(/\s+/g, '-') === target) return true;
      return false;
    });
  }

  if (brand) {
    list = list.filter((p) => (p.brand || '').toLowerCase() === brand.toLowerCase());
  }

  if (q) {
    const query = q.toLowerCase();
    list = list.filter((p) =>
      (p.title || '').toLowerCase().includes(query) ||
      (p.brand || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.collections || '').toLowerCase().includes(query)
    );
  }

  // Sorting
  if (sort === 'price-ascending') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-descending') list.sort((a, b) => b.price - a.price);
  else if (sort === 'title-ascending') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  else if (sort === 'title-descending') list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  else if (sort === 'created-descending') list.sort((a, b) => (b.id || 0) - (a.id || 0));

  const total = list.length;
  const pNum = Math.max(1, parseInt(page) || 1);
  const lNum = Math.min(100, Math.max(1, parseInt(limit) || 24));
  const start = (pNum - 1) * lNum;
  const paginated = list.slice(start, start + lNum);

  return {
    products: paginated,
    total,
    page: pNum,
    pages: Math.max(1, Math.ceil(total / lNum))
  };
};

export const getProduct = async (handle) => {
  const deleted = new Set(getDeletedProductHandles());
  if (deleted.has(handle)) throw new Error('404');

  const customMatch = getCustomProducts().find((p) => p.handle === handle);
  if (customMatch) return customMatch;

  if (shouldTryApi()) {
    try {
      const res = await get('/api/products/' + handle, 2000);
      if (res && res.title) return res;
    } catch { }
  }
  const all = getAllLocalProducts();
  const found = all.find((p) => p.handle === handle);
  if (found) return found;
  throw new Error('404');
};

export const getCollectionSync = (handle = 'all') => {
  const clean = handle ? handle.toLowerCase().trim() : 'all';
  if (COLLECTION_META[clean]) {
    return { handle: clean, ...COLLECTION_META[clean] };
  }
  const title = (clean || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    handle: clean,
    title,
    description: `Discover our exclusive selection of luxury fragrances for ${title} at Perfume Zone UK.`
  };
};

export const getCollection = async (handle = 'all') => {
  const local = getCollectionSync(handle);
  if (shouldTryApi()) {
    try {
      const res = await get('/api/collections/' + handle, 1500);
      if (res && res.title) return { ...local, ...res };
    } catch { }
  }
  return local;
};

const SEED_ORDERS = [
  {
    id: 'PZ-100001',
    email: 'demo@perfumezone.uk',
    customerName: 'Demo Customer',
    shippingAddress: {
      firstName: 'Demo',
      lastName: 'Customer',
      address: '10 Oxford Street',
      apartment: 'Flat 2B',
      city: 'London',
      postcode: 'W1D 1BS',
      country: 'United Kingdom',
      phone: '+44 7700 900123'
    },
    items: [
      {
        id: 1,
        handle: 'oud-elixir-dubai-oud-intense',
        title: 'Oud Elixir Dubai Oud Intense',
        brand: 'Oud Elixir',
        size: '100ml Extrait De Parfum',
        price: 65.0,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 4,
        handle: 'lattafa-khamrah',
        title: 'Lattafa Khamrah Luxury Edition',
        brand: 'Lattafa',
        size: '100ml Eau De Parfum',
        price: 42.0,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80'
      }
    ],
    shippingMethod: 'free',
    shippingCost: 0,
    subtotal: 107.0,
    discount: 10.7,
    couponCode: 'PERFUME10',
    total: 96.3,
    paymentMethod: 'card',
    status: 'Dispatched',
    trackingNumber: 'RM984512004GB',
    courier: 'Royal Mail Tracked 48',
    adminNote: 'Insulated luxury gift box dispatched from London hub.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

function ensureLocalOrdersInitialized() {
  try {
    const initialized = localStorage.getItem(ORDERS_INIT_KEY);
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    if (!initialized) {
      const merged = existing.length ? existing : SEED_ORDERS;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
      localStorage.setItem(ORDERS_INIT_KEY, '1');
      return merged;
    }
    return Array.isArray(existing) ? existing : [];
  } catch {
    return [...SEED_ORDERS];
  }
}

function readSubscribersLocal() {
  try {
    const initialized = localStorage.getItem(SUBSCRIBERS_INIT_KEY);
    const existing = JSON.parse(localStorage.getItem(SUBSCRIBERS_KEY) || '[]');
    if (!initialized) {
      const seeded = existing.length
        ? existing
        : [
            { email: 'demo@perfumezone.uk', source: 'checkout', status: 'subscribed', subscribed_at: new Date().toISOString() },
            { email: 'newsletter@perfumezone.uk', source: 'footer', status: 'subscribed', subscribed_at: new Date().toISOString() }
          ];
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(seeded));
      localStorage.setItem(SUBSCRIBERS_INIT_KEY, '1');
      return seeded;
    }
    return Array.isArray(existing) ? existing : [];
  } catch {
    return [];
  }
}

export const subscribe = async (email, source = 'footer') => {
  const clean = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(clean)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  try {
    const subs = readSubscribersLocal();
    if (!subs.some((s) => (s.email || '').toLowerCase() === clean)) {
      subs.unshift({ email: clean, source, status: 'subscribed', subscribed_at: new Date().toISOString() });
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
    }
  } catch {}

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const r = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean, source }),
      signal: controller.signal
    });
    clearTimeout(timer);
    const data = await r.json();
    if (!r.ok) return { ok: false, error: data.error || 'Subscription failed' };
    apiOnline = true;
    lastHealthCheck = Date.now();
    return data;
  } catch {
    return { ok: true };
  }
};

export const getSubscribersAdmin = async () => {
  const localSubs = readSubscribersLocal();
  if (shouldTryApi()) {
    try {
      const data = await get('/api/subscribers', 1500);
      if (data && Array.isArray(data.subscribers)) {
        const seen = new Set(localSubs.map((s) => (s.email || '').toLowerCase()));
        const combined = [...localSubs];
        for (const s of data.subscribers) {
          if (!seen.has((s.email || '').toLowerCase())) combined.push(s);
        }
        return combined;
      }
    } catch {}
  }
  return localSubs;
};

export const deleteSubscriberAdmin = (email) => {
  const clean = String(email || '').trim().toLowerCase();
  const next = readSubscribersLocal().filter((s) => (s.email || '').toLowerCase() !== clean);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(next));
  return next;
};

export const createOrder = async (orderData) => {
  const orderId = 'PZ-' + Math.floor(100000 + Math.random() * 900000);
  let finalOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
    trackingNumber: '',
    courier: 'Royal Mail Tracked',
    ...orderData
  };

  if (orderData?.newsletter && orderData?.email) {
    subscribe(orderData.email, 'checkout').catch(() => {});
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalOrder),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (r.ok) {
      const res = await r.json();
      if (res && res.order) finalOrder = { ...finalOrder, ...res.order };
      apiOnline = true;
      lastHealthCheck = Date.now();
    }
  } catch {}

  try {
    const orders = ensureLocalOrdersInitialized();
    orders.unshift(finalOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }

  return finalOrder;
};

export const getOrderById = async (id) => {
  const cleanId = String(id || '').trim().toUpperCase();
  const localOrders = ensureLocalOrdersInitialized();
  const localMatch = localOrders.find((o) => String(o.id || '').toUpperCase() === cleanId);
  if (localMatch) return localMatch;

  if (shouldTryApi()) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('/api/orders/' + encodeURIComponent(id), { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        apiOnline = true;
        lastHealthCheck = Date.now();
        if (data && data.id) return data;
      }
    } catch {}
  }

  return null;
};

export const getUserOrders = async (email) => {
  const localOrders = ensureLocalOrdersInitialized().filter(
    (o) => (o.email || '').toLowerCase() === (email || '').toLowerCase()
  );

  let apiOrders = [];
  if (shouldTryApi()) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('/api/users/orders?email=' + encodeURIComponent(email), { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        apiOnline = true;
        lastHealthCheck = Date.now();
        if (data && Array.isArray(data.orders)) apiOrders = data.orders;
      }
    } catch {}
  }

  const seenIds = new Set(localOrders.map((o) => o.id));
  return [...localOrders, ...apiOrders.filter((o) => !seenIds.has(o.id))];
};

export const getAllOrdersAdmin = () => ensureLocalOrdersInitialized();

export const updateOrderAdmin = (orderId, patch) => {
  const orders = ensureLocalOrdersInitialized();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return orders[idx];
};

export const deleteOrderAdmin = (orderId) => {
  const next = ensureLocalOrdersInitialized().filter((o) => o.id !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  return next;
};

// Blogs CMS Helpers
export const getBlogs = (includeDrafts = false) => {
  let list;
  try {
    const raw = JSON.parse(localStorage.getItem(BLOGS_KEY));
    list = Array.isArray(raw) ? raw : INITIAL_BLOGS;
  } catch {
    list = INITIAL_BLOGS;
  }
  return includeDrafts ? list : list.filter((b) => b.published !== false);
};

export const saveBlogAdmin = (post) => {
  const list = getBlogs(true);
  const slug =
    post.slug ||
    String(post.title || '')
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    'post-' + Date.now();

  const normalized = {
    id: post.id || Date.now(),
    slug,
    title: String(post.title || 'Untitled Article').trim(),
    category: String(post.category || 'Fragrance Insights').trim(),
    date: String(
      post.date ||
        new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    ).trim(),
    readTime: String(post.readTime || '4 min read').trim(),
    img:
      String(post.img || '').trim() ||
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    excerpt: String(post.excerpt || '').trim(),
    content: String(post.content || post.excerpt || '').trim(),
    published: post.published !== false
  };

  const idx = list.findIndex((b) => b.id === normalized.id);
  const next = idx >= 0 ? list.map((b) => (b.id === normalized.id ? normalized : b)) : [normalized, ...list];
  localStorage.setItem(BLOGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('pz:blogs-change'));
  return normalized;
};

export const deleteBlogAdmin = (id) => {
  const next = getBlogs(true).filter((b) => b.id !== id);
  localStorage.setItem(BLOGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('pz:blogs-change'));
  return next;
};

export const resetBlogsAdmin = () => {
  localStorage.removeItem(BLOGS_KEY);
  window.dispatchEvent(new Event('pz:blogs-change'));
  return INITIAL_BLOGS;
};

// Storefront Content / Site Settings CMS Helpers
export const DEFAULT_SITE_SETTINGS = {
  announcements: [
    'Free UK delivery on all orders over £50 • perfumezone.uk',
    '100% Genuine Arabian Luxury Perfumes & Rare Oud',
    'Use code PERFUME10 at checkout for 10% off your order'
  ],
  promoCode: 'PERFUME10',
  promoTitle: '10% Off Your Entire Order',
  promoDescription: 'Enjoy 10% off your entire first purchase across all collections with no minimum spend required.',
  offersHeadline: 'Perfume Zone Special Offers',
  offersSubheadline:
    'Experience world-class Arabian fragrances with our current promotions, complimentary gifts, and limited-time savings at perfumezone.uk.'
};

export const getSiteSettings = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(SITE_SETTINGS_KEY));
    if (raw && typeof raw === 'object') {
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...raw,
        announcements:
          Array.isArray(raw.announcements) && raw.announcements.length
            ? raw.announcements
            : DEFAULT_SITE_SETTINGS.announcements
      };
    }
  } catch {}
  return DEFAULT_SITE_SETTINGS;
};

export const saveSiteSettings = (patch) => {
  const next = { ...getSiteSettings(), ...patch };
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('pz:settings-change'));
  return next;
};

export const resetSiteSettings = () => {
  localStorage.removeItem(SITE_SETTINGS_KEY);
  window.dispatchEvent(new Event('pz:settings-change'));
  return DEFAULT_SITE_SETTINGS;
};

export const money = (n) => '£' + Number(n || 0).toFixed(2);
