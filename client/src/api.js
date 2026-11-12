import { INITIAL_PRODUCTS } from './data/products.js';

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

export const getCustomProducts = () => {
  try {
    return JSON.parse(localStorage.getItem('perfumezone_custom_products')) || [];
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
    localStorage.setItem('perfumezone_custom_products', JSON.stringify(merged));

    // Background sync to API if available
    fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: newProducts }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
    }).catch(() => { });

    return merged;
  } catch (err) {
    console.error('Failed to save imported products', err);
    return [];
  }
};

export const clearCustomProducts = () => {
  localStorage.removeItem('perfumezone_custom_products');
};

export const getAllLocalProducts = () => {
  const custom = getCustomProducts();
  const customHandles = new Set(custom.map((p) => p.handle));
  const base = INITIAL_PRODUCTS.filter((p) => !customHandles.has(p.handle));
  return [...custom, ...base];
};

export const getProducts = async (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));

  // Attempt API query (PostgreSQL backend)
  if (shouldTryApi()) {
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

export const subscribe = async (email, source = 'footer') => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const r = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
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

export const createOrder = async (orderData) => {
  const orderId = 'PZ-' + Math.floor(100000 + Math.random() * 900000);
  let finalOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
    ...orderData
  };

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
      if (res && res.order) finalOrder = res.order;
      apiOnline = true;
      lastHealthCheck = Date.now();
    }
  } catch { }

  try {
    const orders = JSON.parse(localStorage.getItem('perfumezone_orders')) || [];
    orders.unshift(finalOrder);
    localStorage.setItem('perfumezone_orders', JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }

  return finalOrder;
};

export const getOrderById = async (id) => {
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
    } catch { }
  }

  try {
    const orders = JSON.parse(localStorage.getItem('perfumezone_orders')) || [];
    return orders.find((o) => o.id === id);
  } catch {
    return null;
  }
};

export const getUserOrders = async (email) => {
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
    } catch { }
  }

  try {
    const orders = JSON.parse(localStorage.getItem('perfumezone_orders')) || [];
    const localOrders = orders.filter((o) => (o.email || '').toLowerCase() === (email || '').toLowerCase());
    if (apiOrders.length === 0) return localOrders;
    const seenIds = new Set(apiOrders.map((o) => o.id));
    return [...apiOrders, ...localOrders.filter((o) => !seenIds.has(o.id))];
  } catch {
    return apiOrders;
  }
};

export const money = (n) => '£' + Number(n || 0).toFixed(2);
