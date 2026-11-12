// Initial/seeded orders data for Perfume Zone frontend & tracking preview.
// New orders placed during checkout are stored in browser localStorage ('perfumezone_orders')
// AND synced via POST /api/orders to server/data/orders.json (and PostgreSQL when connected).

export const INITIAL_ORDERS = [
  {
    id: 'PZ-100001',
    userId: 2,
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
    createdAt: '2026-11-10T10:30:00.000Z'
  }
];

