const c = (t, h) => ({ label: t, to: `/collections/${h}` });

export const BRAND_COLUMNS = [
  {
    title: 'FEATURED HOUSES',
    links: [
      c('AFNAN', 'afnan'),
      c('AL HARAMAIN', 'al-haramain'),
      c('ARBIYAT PRESTIGE', 'arbiyat-prestige'),
      c('ARD AL ZAAFARAN', 'ard-al-zaafaran'),
      c('ARMAF', 'armaf'),
      c('BUJAIRAMI', 'bujairami')
    ]
  },
  {
    title: 'ARABIAN ICONS',
    links: [
      c('FRAGRANCE WORLD', 'fragrance-world'),
      c('FRENCH AVENUE', 'french-avenue'),
      c('KHADLAJ', 'khadlaj'),
      c('LATTAFA', 'lattafa'),
      c('MAISON ASRAR', 'maison-asrar'),
      c('OUD ELIXIR', 'oud-elixir')
    ]
  },
  {
    title: 'PRESTIGE PERFUMERS',
    links: [
      c('PARIS CORNER', 'paris-corner'),
      c('RASASI', 'rasasi'),
      c('RAYHAAN', 'rayhaan'),
      c('SWISS ARABIAN', 'swiss-arabian'),
      c('ZIMAYA', 'zimaya'),
      { label: 'VIEW ALL BRANDS →', to: '/collections/all' }
    ]
  }
];

export const BRAND_FEATURE = {
  label: 'Explore Complete Arabian Collection',
  to: '/collections/all'
};

export const NAV = [
  { label: 'NEW RELEASES', to: '/collections/new-releases' },
  { label: 'BEST SELLERS', to: '/collections/best-sellers' },
  { label: 'UNISEX', to: '/collections/unisex-perfume' },
  { label: 'FOR HIM', to: '/collections/for-him' },
  { label: 'FOR HER', to: '/collections/for-her' },
  {
    label: 'BRANDS',
    to: '/collections/all',
    columns: BRAND_COLUMNS,
    feature: BRAND_FEATURE
  },
  { label: 'LOCATIONS', to: '/pages/locations' },
  { label: 'CONTACT US', to: '/pages/contact' }
];

export const FOOTER = {
  company: [
    ['About Us', '/pages/about-us'],
    ['Store Locations', '/pages/locations'],
    ['Track Your Order', '/account/track-order'],
    ['Wholesale & B2B', '/pages/wholesale'],
    ['Contact Us', '/pages/contact'],
    ['FAQ', '/pages/faqs']
  ],
  legal: [
    ['Terms & Conditions', '/policies/terms-of-service'],
    ['Privacy Policy', '/policies/privacy-policy'],
    ['Return & Refund Policy', '/policies/refund-policy'],
    ['Shipping & Delivery', '/policies/shipping-policy']
  ]
};

export const COUNTRIES = [
  'United Kingdom (GBP £)',
  'France (EUR €)',
  'Germany (EUR €)',
  'Netherlands (EUR €)',
  'Spain (EUR €)',
  'Czechia (EUR €)',
  'Poland (EUR €)',
  'United States (USD $)'
];
