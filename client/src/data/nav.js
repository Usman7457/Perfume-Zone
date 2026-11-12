const c = (t, h) => ({ label: t, to: `/collections/${h}` });

export const NAV = [
  {
    label: 'FRAGRANCE',
    columns: [
      {
        title: 'FEATURED',
        links: [
          c('NEW IN', 'new-in'),
          c('BEST SELLERS', 'best-sellers'),
          c('FRAGRANCE SETS', 'fragrance-sets'),
          c('LAST CHANCE', 'last-chance')
        ]
      },
      {
        title: 'CATEGORIES',
        links: [
          c("WOMEN'S", 'womens'),
          c("MEN'S", 'mens'),
          c('UNISEX', 'unisex'),
          c('Extrait De Parfum', 'extrait-de-parfum'),
          c('PERFUME OILS', 'perfume-oils'),
          c('DEODORANTS', 'deodorants'),
          c('AIR FRESHNERS', 'air-freshners')
        ]
      },
      {
        title: 'FRAGRANCE FAMILY',
        links: [
          c('OUD', 'oud-1'),
          c('AMBER', 'amber'),
          c('GOURMAND', 'gourmand'),
          c('WOODY', 'woody'),
          c('FRUITY', 'fruity-1'),
          c('FLORAL', 'floral')
        ]
      },
      {
        title: 'FRAGRANCE WARDROBE',
        links: [
          c('SUMMER', 'summer-fragrances'),
          c('SPRING', 'spring-collection'),
          c('AUTUMN', 'autumn'),
          c('WINTER', 'winter'),
          c('EVERYDAY', 'everyday-fragrances'),
          c('EVENING', 'evening-fragrances')
        ]
      }
    ],
    feature: {
      label: 'Signature Scent: Oud Elixir Dubai Oud Intense',
      to: '/products/oud-elixir-dubai-oud-intense'
    }
  },
  {
    label: 'BRANDS',
    columns: [
      {
        title: 'OUR EXCLUSIVE BRANDS',
        links: [
          c('OUD ELIXIR', 'oud-elixir'),
          c('ESSENTIAL PERFUME', 'essential-perfume'),
          c('BLENDS OF DUBAI', 'blends-of-dubai'),
          c('VIALI', 'viali')
        ]
      },
      {
        title: 'FEATURED HOUSES',
        links: [
          c('AFNAN', 'afnan'),
          c('RAYHAAN', 'rayhaan'),
          c('SWISS ARABIAN', 'swiss-arabian'),
          c('GULF ORCHID', 'gulf-orchid'),
          c('ZIMAYA', 'zimaya'),
          c('RUE BROCA', 'rue-broca')
        ]
      },
      {
        title: 'MORE ICONS',
        links: [
          c('LATTAFA', 'lattafa'),
          c('AJMAL', 'ajmal'),
          c('RASASI', 'rasasi'),
          c('ARD AL ZAAFARAN', 'ard-al-zaafaran')
        ]
      }
    ],
    feature: {
      label: 'Trending House: Lattafa Luxury',
      to: '/collections/lattafa'
    }
  },
  { label: 'PERFUME OFFERS', to: '/pages/perfume-offers' },
  {
    label: 'World of PERFUME ZONE',
    columns: [
      {
        title: 'Our Story',
        links: [
          { label: 'About Us', to: '/pages/about-us' },
          { label: 'Our Partners', to: '/pages/our-partners' },
          { label: 'Our Creations', to: '/pages/our-creations' }
        ]
      },
      {
        title: 'Fragrance Insights',
        links: [
          { label: 'Fragrance Insights Blog', to: '/blogs/fragrance-insights' },
          { label: 'The Art of Gifting', to: '/pages/the-art-of-gifting' },
          { label: 'Frequently Asked Questions', to: '/pages/faqs' }
        ]
      },
      {
        title: 'Locations & Services',
        links: [
          { label: 'Find a Store', to: '/tools/locations' },
          { label: 'Wholesale B2B', to: '/pages/wholesale' },
          { label: 'Contact Us', to: '/pages/contact-us' }
        ]
      }
    ],
    feature: {
      label: 'Explore UK Boutique Showroom',
      to: '/tools/locations'
    }
  },
  { label: 'IMPORT PRODUCTS', to: '/import' }
];

export const FOOTER = {
  company: [
    ['About Us', '/pages/about-us'],
    ['Find a Store', '/tools/locations'],
    ['Wholesale & B2B', '/pages/wholesale'],
    ['Contact Us', '/pages/contact-us'],
    ['FAQ', '/pages/faqs'],
    ['Fragrance Insights', '/blogs/fragrance-insights'],
    ['Import Products (Excel)', '/import']
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
