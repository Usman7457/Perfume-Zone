import { INITIAL_PRODUCTS } from './data/products.js';
import { INITIAL_BLOGS } from './data/blogs.js';
import { INITIAL_ORDERS } from './data/orders.js';
import DEFAULT_SITE_CONTENT from './data/siteContent.json';

// Track backend API availability to avoid repeated slow hangs
let apiOnline = null; // null = untried, true = online, false = offline
let lastHealthCheck = 0;

export const COLLECTION_META = {
  'all': {
    title: 'All Fragrances',
    description: 'Explore our complete library of authentic luxury Arabian perfumes, rare Oud, and artisan extraits at Perfume Zone UK.'
  },
  'new-releases': {
    title: 'New Releases',
    description: 'The freshest creations and new season arrivals from the prestigious perfume houses of Dubai and Europe.'
  },
  'new-in': {
    title: 'New Releases',
    description: 'The freshest creations and new season arrivals from the prestigious perfume houses of Dubai and Europe.'
  },
  'best-sellers': {
    title: 'Best Sellers',
    description: 'Our most coveted and acclaimed signature perfumes, loved by fragrance connoisseurs across the UK.'
  },
  'unisex-perfume': {
    title: 'Unisex',
    description: 'Captivating compositions that transcend boundaries—amber, agarwood, tonka bean, and spiced florals.'
  },
  'unisex': {
    title: 'Unisex',
    description: 'Captivating compositions that transcend boundaries—amber, agarwood, tonka bean, and spiced florals.'
  },
  'for-him': {
    title: 'For Him',
    description: "Assertive woody, smoky oud, fresh citrus, and spicy leathers crafted exclusively for him."
  },
  'mens': {
    title: 'For Him',
    description: "Assertive woody, smoky oud, fresh citrus, and spicy leathers crafted exclusively for him."
  },
  'for-her': {
    title: 'For Her',
    description: "Sensual floral, gourmand vanilla, sweet fruits, and delicate musks crafted exclusively for her."
  },
  'womens': {
    title: 'For Her',
    description: "Sensual floral, gourmand vanilla, sweet fruits, and delicate musks crafted exclusively for her."
  },
  'sale': {
    title: 'Sale',
    description: 'Explore limited-time reductions, special fragrance offers, and discounted flacons at Perfume Zone UK.'
  },
  'afnan': {
    title: 'Afnan Perfumes',
    description: 'Explore Afnan luxury flacons, including Supremacy, Historic, and Rare Passion.'
  },
  'al-haramain': {
    title: 'Al Haramain',
    description: "Legendary Arabian perfumery featuring Amber Oud, L'Aventure, and exquisite attars."
  },
  'arbiyat-prestige': {
    title: 'Arbiyat Prestige',
    description: 'Artisan Arabian extraits with opulent sillage and regal flacon design.'
  },
  'ard-al-zaafaran': {
    title: 'Ard Al Zaafaran',
    description: 'Celebrated oriental blends of pure musk, dark rose, and warm woods.'
  },
  'armaf': {
    title: 'Armaf',
    description: 'World-renowned masterpieces including Club De Nuit Intense and Odyssey.'
  },
  'bujairami': {
    title: 'Bujairami',
    description: 'Modern, high-concentration luxury fragrance creations crafted for longevity.'
  },
  'fragrance-world': {
    title: 'Fragrance World',
    description: 'Exceptional olfactory interpretations of legendary haute parfumerie.'
  },
  'french-avenue': {
    title: 'French Avenue',
    description: 'Haute French perfumery married with rich oriental Arabian heritage.'
  },
  'khadlaj': {
    title: 'Khadlaj Perfumes',
    description: 'Over 25 years of artisan Arabian flacons, concentrated oils, and room mists.'
  },
  'lattafa': {
    title: 'Lattafa',
    description: 'Iconic Dubai perfumery famous for Khamrah, Yara, Asad, and Badee Al Oud.'
  },
  'maison-asrar': {
    title: 'Maison Asrar',
    description: 'Ultra-luxurious flacons blending royal agarwood, ambergris, and velvet rose.'
  },
  'oud-elixir': {
    title: 'Oud Elixir',
    description: 'Artisan high-concentration pure extraits capturing Cambodian and royal Dubai oud.'
  },
  'paris-corner': {
    title: 'Paris Corner',
    description: 'Trendsetting fragrance collections featuring Emir, Ministry of Oud, and Killer Oud.'
  },
  'rasasi': {
    title: 'Rasasi',
    description: 'Prestigious oriental dynasty famous for Hawas, Shuhrah, and La Yuqawam.'
  },
  'rayhaan': {
    title: 'Rayhaan',
    description: 'Contemporary Arabian perfumery with electrifying projection and modern aesthetic.'
  },
  'swiss-arabian': {
    title: 'Swiss Arabian',
    description: 'The pioneer of UAE perfumery, renowned for Shaghaf Oud, Casablanca, and pure attars.'
  },
  'zimaya': {
    title: 'Zimaya',
    description: 'Exquisite modern compositions by Afnan group featuring Sharaf Blend and Fatima.'
  },
  'fragrance-sets': {
    title: 'Fragrance Discovery & Gift Sets',
    description: 'Curated luxury discovery sets, travel atomisers, and bespoke gift presentations.'
  },
  'last-chance': {
    title: 'Last Chance & Limited Reductions',
    description: 'Rare flacons and final quantities of limited edition luxury extraits at special pricing.'
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
const CATEGORY_DISCOUNTS_KEY = 'perfumezone_category_discounts';

export const DISCOUNT_CATEGORIES = [
  { value: 'all', label: 'All Fragrances (Entire Storewide)' },
  { value: 'for-him', label: "For Him (Men's Fragrances)" },
  { value: 'for-her', label: "For Her (Women's Fragrances)" },
  { value: 'unisex-perfume', label: 'Unisex Fragrances' },
  { value: 'new-releases', label: 'New Releases' },
  { value: 'best-sellers', label: 'Best Sellers' },
  { value: 'sale', label: 'Clearance & Special Sale' },
  { value: 'fragrance-sets', label: 'Fragrance Discovery & Gift Sets' },
  { value: 'perfume-oils', label: 'Concentrated Perfume Oils (Attar)' },
  { value: 'deodorants', label: 'Luxury Perfumed Deodorants' },
  { value: 'air-freshners', label: 'Air & Room Fresheners' },
  { value: 'lattafa', label: 'Brand: Lattafa' },
  { value: 'afnan', label: 'Brand: Afnan' },
  { value: 'rasasi', label: 'Brand: Rasasi' },
  { value: 'armaf', label: 'Brand: Armaf' },
  { value: 'swiss-arabian', label: 'Brand: Swiss Arabian' },
  { value: 'al-haramain', label: 'Brand: Al Haramain' },
  { value: 'paris-corner', label: 'Brand: Paris Corner' },
  { value: 'zimaya', label: 'Brand: Zimaya' },
  { value: 'french-avenue', label: 'Brand: French Avenue' },
  { value: 'fragrance-world', label: 'Brand: Fragrance World' },
  { value: 'khadlaj', label: 'Brand: Khadlaj' },
  { value: 'ard-al-zaafaran', label: 'Brand: Ard Al Zaafaran' }
];

export const getCategoryDiscounts = () => {
  try {
    const raw = localStorage.getItem(CATEGORY_DISCOUNTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveCategoryDiscount = (rule) => {
  try {
    const discounts = getCategoryDiscounts();
    const id = rule.id || ('disc_' + Date.now());
    let categories = [];
    if (Array.isArray(rule.categories)) {
      categories = rule.categories.filter(Boolean);
    } else if (typeof rule.category === 'string') {
      categories = rule.category.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!categories.length) categories = ['all'];

    const cleanRule = {
      id,
      title: String(rule.title || 'Category Promotion').trim(),
      categories,
      category: categories.join(', '),
      type: rule.type === 'flat' ? 'flat' : 'percent',
      value: Math.max(0.1, Number(rule.value) || 10),
      active: rule.active !== false,
      createdAt: rule.createdAt || new Date().toISOString()
    };
    const idx = discounts.findIndex((d) => d.id === id);
    if (idx >= 0) {
      discounts[idx] = cleanRule;
    } else {
      discounts.unshift(cleanRule);
    }
    localStorage.setItem(CATEGORY_DISCOUNTS_KEY, JSON.stringify(discounts));
    window.dispatchEvent(new Event('pz:discounts-change'));
    window.dispatchEvent(new Event('pz:products-change'));
    return cleanRule;
  } catch (err) {
    console.error('Failed to save category discount', err);
    return null;
  }
};

export const toggleCategoryDiscount = (id) => {
  try {
    const discounts = getCategoryDiscounts();
    const item = discounts.find((d) => d.id === id);
    if (item) {
      item.active = !item.active;
      localStorage.setItem(CATEGORY_DISCOUNTS_KEY, JSON.stringify(discounts));
      window.dispatchEvent(new Event('pz:discounts-change'));
      window.dispatchEvent(new Event('pz:products-change'));
      return item;
    }
  } catch (err) {
    console.error('Failed to toggle discount', err);
  }
  return null;
};

export const deleteCategoryDiscount = (id) => {
  try {
    const discounts = getCategoryDiscounts().filter((d) => d.id !== id);
    localStorage.setItem(CATEGORY_DISCOUNTS_KEY, JSON.stringify(discounts));
    window.dispatchEvent(new Event('pz:discounts-change'));
    window.dispatchEvent(new Event('pz:products-change'));
  } catch (err) {
    console.error('Failed to delete discount', err);
  }
};

export const doesProductMatchSingleCategory = (product, category) => {
  if (!product || !category) return false;
  const target = String(category).toLowerCase().trim();
  if (target === 'all') return true;

  const cols = (product.collections || '').toLowerCase().split('|').map((s) => s.trim());
  if (cols.includes(target)) return true;

  if ((target === 'for-him' || target === 'mens') && (cols.includes('for-him') || cols.includes('mens'))) return true;
  if ((target === 'for-her' || target === 'womens') && (cols.includes('for-her') || cols.includes('womens'))) return true;
  if ((target === 'unisex-perfume' || target === 'unisex') && (cols.includes('unisex-perfume') || cols.includes('unisex') || (!cols.includes('for-him') && !cols.includes('for-her') && !cols.includes('mens') && !cols.includes('womens')))) return true;
  if ((target === 'new-releases' || target === 'new-release1' || target === 'new-in') && (cols.includes('new-releases') || cols.includes('new-release1') || cols.includes('new-in') || product.id <= 10)) return true;
  if (target === 'best-sellers' && (cols.includes('best-sellers') || product.price > 40)) return true;
  if ((target === 'sale' || target === 'last-chance') && (cols.includes('sale') || cols.includes('last-chance') || (product.compare_at_price && product.compare_at_price > product.price))) return true;

  const brandNormalized = (product.brand || '').toLowerCase().replace(/[\s\xa0-]+/g, '-');
  if (brandNormalized === target.replace(/[\s\xa0-]+/g, '-')) return true;

  return false;
};

export const doesProductMatchCategory = (product, category) => {
  if (!product || !category) return false;
  const catList = Array.isArray(category)
    ? category
    : String(category).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

  if (!catList.length || catList.includes('all')) return true;
  return catList.some((cat) => doesProductMatchSingleCategory(product, cat));
};

export const applyCategoryDiscountsToProducts = (products = []) => {
  const activeDiscounts = getCategoryDiscounts().filter((d) => d.active);
  if (!activeDiscounts.length) {
    return products.map((p) => {
      const basePrice = p._base_price != null ? p._base_price : p.price;
      const baseCompare = p._base_compare_at !== undefined ? p._base_compare_at : (p.compare_at_price || null);
      return {
        ...p,
        price: basePrice,
        compare_at_price: baseCompare,
        is_on_sale: Boolean(baseCompare && baseCompare > basePrice)
      };
    });
  }

  return products.map((p) => {
    const basePrice = p._base_price != null ? p._base_price : Number(p.price || 0);
    const baseCompare = p._base_compare_at !== undefined ? p._base_compare_at : (p.compare_at_price ? Number(p.compare_at_price) : null);

    const matchingRules = activeDiscounts.filter((rule) =>
      doesProductMatchCategory(p, rule.categories || rule.category)
    );
    if (!matchingRules.length) {
      return {
        ...p,
        price: basePrice,
        compare_at_price: baseCompare,
        is_on_sale: Boolean(baseCompare && baseCompare > basePrice)
      };
    }

    let bestRule = null;
    let maxSaving = -1;

    for (const rule of matchingRules) {
      let saving = 0;
      if (rule.type === 'percent') {
        saving = (basePrice * rule.value) / 100;
      } else {
        saving = rule.value;
      }
      if (saving > maxSaving) {
        maxSaving = saving;
        bestRule = rule;
      }
    }

    if (!bestRule || maxSaving <= 0) {
      return {
        ...p,
        price: basePrice,
        compare_at_price: baseCompare,
        is_on_sale: Boolean(baseCompare && baseCompare > basePrice)
      };
    }

    const calculatedPrice = Math.max(1, Math.round((basePrice - maxSaving) * 100) / 100);
    const originalRefPrice = baseCompare && baseCompare > calculatedPrice ? baseCompare : basePrice;

    return {
      ...p,
      _base_price: basePrice,
      _base_compare_at: baseCompare,
      price: calculatedPrice,
      compare_at_price: originalRefPrice,
      is_on_sale: true,
      hasDiscount: true,
      discount_rule_title: bestRule.title,
      discount_label: bestRule.type === 'percent' ? `-${Math.round(bestRule.value)}%` : `-£${bestRule.value}`
    };
  });
};

export const isProductOnSale = (product) => {
  if (!product) return false;
  if (product.is_on_sale || product.hasDiscount) return true;
  if (product.compare_at_price && Number(product.compare_at_price) > Number(product.price)) return true;
  const activeDiscounts = getCategoryDiscounts().filter((d) => d.active);
  if (activeDiscounts.length > 0) {
    const discounted = applyCategoryDiscountsToProducts([product]);
    if (discounted[0]?.is_on_sale || discounted[0]?.hasDiscount) return true;
  }
  return false;
};

export const hasCartSaleItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some((item) => isProductOnSale(item));
};

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
    }).catch(() => { });

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
    in_stock: product.in_stock === 0 || product.in_stock === false ? 0 : 1,
    sku: String(product.sku || '').trim() || ('PZ-' + String(product.id || cleanHandle).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)),
    stock_quantity:
      product.stock_quantity !== '' && product.stock_quantity != null
        ? Math.max(0, parseInt(product.stock_quantity, 10) || 0)
        : (product.in_stock === 0 || product.in_stock === false ? 0 : 15)
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

export const getAllRawLocalProducts = () => {
  const custom = getCustomProducts();
  const deleted = new Set(getDeletedProductHandles());
  const customHandles = new Set(custom.map((p) => p.handle));
  const base = INITIAL_PRODUCTS.filter((p) => !customHandles.has(p.handle) && !deleted.has(p.handle));
  return [...custom.filter((p) => !deleted.has(p.handle)), ...base];
};

export const getAllLocalProducts = (applyDiscounts = true) => {
  const raw = getAllRawLocalProducts();
  return applyDiscounts ? applyCategoryDiscountsToProducts(raw) : raw;
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
      if ((target === 'for-him' || target === 'mens') && (cols.includes('for-him') || cols.includes('mens'))) return true;
      if ((target === 'for-her' || target === 'womens') && (cols.includes('for-her') || cols.includes('womens'))) return true;
      if ((target === 'unisex-perfume' || target === 'unisex') && (cols.includes('unisex-perfume') || cols.includes('unisex') || (!cols.includes('for-him') && !cols.includes('for-her') && !cols.includes('mens') && !cols.includes('womens')))) return true;
      if ((target === 'new-releases' || target === 'new-release1' || target === 'new-in') && (cols.includes('new-releases') || cols.includes('new-release1') || cols.includes('new-in') || p.id <= 10)) return true;
      if (target === 'best-sellers' && (cols.includes('best-sellers') || p.price > 40)) return true;
      if ((target === 'sale' || target === 'last-chance') && (cols.includes('sale') || cols.includes('last-chance') || (p.compare_at_price && p.compare_at_price > p.price))) return true;
      if (target === 'fragrance-sets' && cols.includes('fragrance-sets')) return true;
      if (target === 'deodorants' && cols.includes('deodorants')) return true;
      if (target === 'air-freshners' && cols.includes('air-freshners')) return true;
      if (target === 'perfume-oils' && cols.includes('perfume-oils')) return true;
      if (p.brand && p.brand.toLowerCase().replace(/[\s\xa0-]+/g, '-') === target.replace(/[\s\xa0-]+/g, '-')) return true;
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

  const all = getAllLocalProducts(true);
  const found = all.find((p) => p.handle === handle);
  if (found) return found;

  const customMatch = getCustomProducts().find((p) => p.handle === handle);
  if (customMatch) return applyCategoryDiscountsToProducts([customMatch])[0];

  if (shouldTryApi()) {
    try {
      const res = await get('/api/products/' + handle, 2000);
      if (res && res.title) return applyCategoryDiscountsToProducts([res])[0];
    } catch { }
  }
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

function ensureLocalOrdersInitialized() {
  try {
    const initialized = localStorage.getItem(ORDERS_INIT_KEY);
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    if (!initialized) {
      const merged = existing.length ? existing : INITIAL_ORDERS;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
      localStorage.setItem(ORDERS_INIT_KEY, '1');
      return merged;
    }
    return Array.isArray(existing) ? existing : [];
  } catch {
    return [...INITIAL_ORDERS];
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
  } catch { }

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
    } catch { }
  }
  return localSubs;
};

export const deleteSubscriberAdmin = (email) => {
  const clean = String(email || '').trim().toLowerCase();
  const next = readSubscribersLocal().filter((s) => (s.email || '').toLowerCase() !== clean);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(next));
  fetch('/api/newsletter/' + encodeURIComponent(clean), { method: 'DELETE' }).catch(() => { });
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
    subscribe(orderData.email, 'checkout').catch(() => { });
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
  } catch { }

  try {
    const orders = ensureLocalOrdersInitialized();
    const deduped = orders.filter((o) => o.id !== finalOrder.id);
    deduped.unshift(finalOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(deduped));
    window.dispatchEvent(new Event('pz:orders-change'));
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
    } catch { }
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
    } catch { }
  }

  const seenIds = new Set(localOrders.map((o) => o.id));
  return [...localOrders, ...apiOrders.filter((o) => !seenIds.has(o.id))];
};

export const getAllOrdersAdmin = () => ensureLocalOrdersInitialized();

export const fetchAllOrdersAdmin = async () => {
  const localOrders = ensureLocalOrdersInitialized();
  if (shouldTryApi()) {
    try {
      const data = await get('/api/orders', 1500);
      if (data && Array.isArray(data.orders)) {
        const map = new Map();
        for (const o of localOrders) map.set(o.id, o);
        for (const o of data.orders) {
          if (!map.has(o.id)) map.set(o.id, o);
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch { }
  }
  return localOrders;
};

export const updateOrderAdmin = (orderId, patch) => {
  const orders = ensureLocalOrdersInitialized();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('pz:orders-change'));
  fetch('/api/orders/' + encodeURIComponent(orderId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  }).catch(() => { });
  return orders[idx];
};

export const deleteOrderAdmin = (orderId) => {
  const next = ensureLocalOrdersInitialized().filter((o) => o.id !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('pz:orders-change'));
  fetch('/api/orders/' + encodeURIComponent(orderId), { method: 'DELETE' }).catch(() => { });
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
    'Experience world-class Arabian fragrances with our current promotions, complimentary gifts, and limited-time savings at perfumezone.uk.',
  popupEnabled: true,
  popupTitle: '10% Off Your First Fragrance',
  popupSubtitle: 'EXCLUSIVE WELCOME PRIVILEGE',
  popupDescription: 'Unlock instant savings across authentic Dubai luxury perfumes, rare artisan oud, and concentrated attars with code PERFUME10.',
  popupCode: 'PERFUME10',
  popupImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  popupCtaText: 'Shop New Arrivals & Offers',
  popupCtaLink: '/collections/all'
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
  } catch { }
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

// ==========================================
// STOREFRONT CMS CONTENT MANAGEMENT
// ==========================================
export const SITE_CMS_KEY = 'perfumezone_site_cms';

export const getSiteContent = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(SITE_CMS_KEY));
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return {
        ...DEFAULT_SITE_CONTENT,
        ...raw,
        headerNav: (Array.isArray(raw.headerNav) && raw.headerNav.length ? raw.headerNav : DEFAULT_SITE_CONTENT.headerNav).map((n) => {
          const matchDefault = DEFAULT_SITE_CONTENT.headerNav.find((d) => d.id === n.id || d.label?.toLowerCase() === n.label?.toLowerCase());
          if (matchDefault?.columns && (!n.columns || !n.columns.length)) {
            return { ...matchDefault, ...n, columns: matchDefault.columns, feature: matchDefault.feature };
          }
          return n;
        }),
        home: {
          ...DEFAULT_SITE_CONTENT.home,
          ...(raw.home || {}),
          heroSlides: Array.isArray(raw.home?.heroSlides) && raw.home.heroSlides.length ? raw.home.heroSlides : DEFAULT_SITE_CONTENT.home.heroSlides,
          trustBadges: Array.isArray(raw.home?.trustBadges) && raw.home.trustBadges.length ? raw.home.trustBadges : DEFAULT_SITE_CONTENT.home.trustBadges,
          middleBanner: { ...DEFAULT_SITE_CONTENT.home.middleBanner, ...(raw.home?.middleBanner || {}) }
        },
        contact: { ...DEFAULT_SITE_CONTENT.contact, ...(raw.contact || {}) },
        about: {
          ...DEFAULT_SITE_CONTENT.about,
          ...(raw.about || {}),
          values: Array.isArray(raw.about?.values) && raw.about.values.length ? raw.about.values : DEFAULT_SITE_CONTENT.about.values
        },
        faq: {
          ...DEFAULT_SITE_CONTENT.faq,
          ...(raw.faq || {}),
          categories: Array.isArray(raw.faq?.categories) && raw.faq.categories.length ? raw.faq.categories : DEFAULT_SITE_CONTENT.faq.categories
        },
        wholesale: {
          ...DEFAULT_SITE_CONTENT.wholesale,
          ...(raw.wholesale || {}),
          benefits: Array.isArray(raw.wholesale?.benefits) && raw.wholesale.benefits.length ? raw.wholesale.benefits : DEFAULT_SITE_CONTENT.wholesale.benefits
        },
        footer: {
          ...DEFAULT_SITE_CONTENT.footer,
          ...(raw.footer || {}),
          socialLinks: Array.isArray(raw.footer?.socialLinks) && raw.footer.socialLinks.length ? raw.footer.socialLinks : DEFAULT_SITE_CONTENT.footer.socialLinks,
          companyLinks: Array.isArray(raw.footer?.companyLinks) && raw.footer.companyLinks.length ? raw.footer.companyLinks : DEFAULT_SITE_CONTENT.footer.companyLinks,
          legalLinks: Array.isArray(raw.footer?.legalLinks) && raw.footer.legalLinks.length ? raw.footer.legalLinks : DEFAULT_SITE_CONTENT.footer.legalLinks
        }
      };
    }
  } catch {}
  return DEFAULT_SITE_CONTENT;
};

export const saveSiteContent = (sectionOrFull, data = null) => {
  const current = getSiteContent();
  let next;
  if (data !== null && typeof sectionOrFull === 'string') {
    next = {
      ...current,
      [sectionOrFull]: data
    };
  } else if (typeof sectionOrFull === 'object') {
    next = {
      ...current,
      ...sectionOrFull
    };
  } else {
    next = current;
  }

  try {
    localStorage.setItem(SITE_CMS_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('Failed saving CMS to localStorage:', err);
  }

  window.dispatchEvent(new CustomEvent('pz:content-change', { detail: next }));

  // Non-blocking sync to server if available
  fetch('/api/cms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next)
  }).catch(() => {});

  return next;
};

export const resetSiteContent = (section = null) => {
  if (section && DEFAULT_SITE_CONTENT[section]) {
    const current = getSiteContent();
    const next = { ...current, [section]: JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT[section])) };
    try {
      localStorage.setItem(SITE_CMS_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new CustomEvent('pz:content-change', { detail: next }));
    fetch('/api/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next)
    }).catch(() => {});
    return next;
  } else {
    try {
      localStorage.removeItem(SITE_CMS_KEY);
    } catch {}
    window.dispatchEvent(new CustomEvent('pz:content-change', { detail: DEFAULT_SITE_CONTENT }));
    fetch('/api/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_SITE_CONTENT)
    }).catch(() => {});
    return DEFAULT_SITE_CONTENT;
  }
};

export const fetchSiteContentFromBackend = async () => {
  try {
    const res = await fetch('/api/cms');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
        localStorage.setItem(SITE_CMS_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('pz:content-change', { detail: data }));
        return data;
      }
    }
  } catch {}
  return getSiteContent();
};

export const CURRENCIES = {
  GBP: { code: 'GBP', symbol: '£', rate: 1.0, label: 'United Kingdom (GBP £)' },
  EUR: { code: 'EUR', symbol: '€', rate: 1.17, label: 'Eurozone (EUR €)' },
  USD: { code: 'USD', symbol: '$', rate: 1.28, label: 'United States (USD $)' }
};

export const getActiveCurrency = () => {
  if (typeof window === 'undefined') return CURRENCIES.GBP;
  try {
    const raw = localStorage.getItem('perfumezone_country') || '';
    if (raw.includes('EUR') || raw.includes('€')) return CURRENCIES.EUR;
    if (raw.includes('USD') || raw.includes('$')) return CURRENCIES.USD;
  } catch { }
  return CURRENCIES.GBP;
};

export const convertPrice = (n, customCurrency = null) => {
  const cur = customCurrency || getActiveCurrency();
  const num = Number(n || 0);
  return Number((num * (cur.rate || 1.0)).toFixed(2));
};

export const money = (n, customCurrency = null) => {
  const cur = customCurrency || getActiveCurrency();
  const num = Number(n || 0);
  const converted = num * (cur.rate || 1.0);
  return `${cur.symbol}${converted.toFixed(2)}`;
};

/**
 * Converts a selected image file from local device to an optimized Base64 data URL.
 * Automatically downscales large images using canvas to prevent localStorage / JSON quota overflow.
 */
export const fileToOptimizedDataUrl = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPEG, PNG, WebP).'));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading file from local storage.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed loading image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputType, quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
