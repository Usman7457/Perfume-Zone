// Initial test & seeded accounts for local/frontend authentication.
// Later this list can be replaced cleanly with PostgreSQL /api/auth endpoints.

export const SEEDED_USERS = [
  {
    id: 1,
    name: 'Perfume Zone Admin',
    email: 'admin@perfumezone.uk',
    password: 'Admin@123',
    role: 'admin',
    phone: '+44 20 7946 0991',
    address: '48 Mayfair Luxury Lane',
    apartment: 'Suite 4',
    city: 'London',
    postcode: 'W1K 2PB',
    country: 'United Kingdom',
    joinedDate: 'Jan 2026'
  },
  {
    id: 2,
    name: 'Demo Customer',
    email: 'demo@perfumezone.uk',
    password: 'Customer@123',
    role: 'customer',
    phone: '+44 7700 900123',
    address: '10 Oxford Street',
    apartment: 'Flat 2B',
    city: 'London',
    postcode: 'W1D 1BS',
    country: 'United Kingdom',
    joinedDate: 'Feb 2026'
  },
  {
    id: 3,
    name: 'Sarah Khan',
    email: 'sarah@perfumezone.uk',
    password: 'Sarah@123',
    role: 'customer',
    phone: '+44 7700 900456',
    address: '22 King Street',
    apartment: '',
    city: 'Manchester',
    postcode: 'M2 6AG',
    country: 'United Kingdom',
    joinedDate: 'Mar 2026'
  }
];

