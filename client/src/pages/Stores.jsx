import { PinIcon } from '../components/Icons.jsx';

export default function Stores() {
  const stores = [
    {
      name: 'Perfume Zone Flagship Mayfair Boutique',
      address: '48 Mayfair Luxury Lane, London, W1K 2PB',
      phone: '+44 (0) 20 7946 0991',
      hours: 'Monday – Saturday: 10:00 – 19:00 | Sunday: 12:00 – 18:00',
      highlights: 'Full Arabian collection, bespoke scent layering consultations, private Majlis sampling room.'
    },
    {
      name: 'Perfume Zone Manchester Showroom',
      address: '14 St Ann’s Square, Manchester, M2 7EF',
      phone: '+44 (0) 161 832 4110',
      hours: 'Monday – Saturday: 10:00 – 18:30 | Sunday: 11:30 – 17:30',
      highlights: 'Extrait de parfum bar, attar testing lounge, same-day local collection.'
    },
    {
      name: 'Perfume Zone Birmingham Boutique',
      address: 'Upper Mall East, Bullring Estate, Birmingham, B5 4BU',
      phone: '+44 (0) 121 643 8920',
      hours: 'Monday – Saturday: 09:30 – 20:00 | Sunday: 11:00 – 17:00',
      highlights: 'Trending TikTok fragrance sensations, discovery gift sets, luxury gift wrapping.'
    }
  ];

  return (
    <div className="container stores-page">
      <header className="page-header center">
        <span className="eyebrow">VISIT US IN PERSON</span>
        <h1>Perfume Zone UK Boutiques</h1>
        <p className="muted max-prose">
          Experience our rare Arabian flacons, concentrated perfume oils, and artisan Extraits in our intimate boutique spaces.
        </p>
      </header>

      <div className="stores">
        <ul className="stores-list">
          {stores.map((s) => (
            <li key={s.name} className="store-card">
              <div className="store-pin-badge">
                <PinIcon />
              </div>
              <div className="store-info-content">
                <h3>{s.name}</h3>
                <p className="store-address"><strong>Address:</strong> {s.address}</p>
                <p className="store-phone"><strong>Phone:</strong> {s.phone}</p>
                <p className="store-hours muted"><strong>Opening Hours:</strong> {s.hours}</p>
                <p className="store-highlights"><em>{s.highlights}</em></p>
              </div>
            </li>
          ))}
        </ul>

        <div className="store-map-box">
          <div className="map-visual-placeholder">
            <PinIcon />
            <h3>Interactive UK Showroom Map</h3>
            <p className="muted">Visit our Mayfair Flagship or call ahead to book a complimentary 1-on-1 private scent session.</p>
            <a href="https://perfumezone.uk" className="btn ghost">perfumezone.uk Concierge</a>
          </div>
        </div>
      </div>
    </div>
  );
}
