import { Link } from 'react-router-dom';
import { PinIcon, ShieldIcon, CheckIcon } from '../components/Icons.jsx';

export default function Stores() {
  const store = {
    name: 'Perfume Zone Flagship Store',
    mall: 'Unit 38, Marlands Shopping Centre',
    street: 'Civic Centre Road',
    city: 'Southampton',
    postcode: 'SO14 7SJ',
    country: 'United Kingdom',
    phone: '+44 (0) 20 7946 0991',
    email: 'support@perfumezone.uk',
    hours: 'Monday – Saturday: 09:30 AM – 5:30 PM | Sunday: 11:00 AM – 5:00 PM',
    highlights: 'Official authorized boutique for authentic Dubai and European perfume houses. Complimentary 1-on-1 private scent layering consultations, pure agarwood (oud) bar, and same-day in-store collection.',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Perfume+Zone+Unit+38+Marlands+Shopping+Centre+Civic+Centre+Road+Southampton+SO14+7SJ'
  };

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
      title: 'Arabian Extrait & Pure Oud Bar',
      desc: 'Sample authentic flacons direct from Dubai and Gulf perfumeries.'
    },
    {
      url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
      title: 'Artisan Fragrance Wardrobe',
      desc: 'Bespoke layering advice and long-lasting oriental sillage.'
    },
    {
      url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1000&q=80',
      title: 'Luxury Gift Presentation',
      desc: 'Signature insulated protective boxes and complimentary ribbon gift wrapping.'
    }
  ];

  return (
    <div className="container stores-page">
      <header className="page-header center">
        <span className="eyebrow">VISIT OUR OFFICIAL UK STORE</span>
        <h1>Perfume Zone Flagship Boutique</h1>
        <p className="muted max-prose">
          Experience our rare Arabian flacons, concentrated pure perfume oils (attars), and artisan Extraits in person at our official Southampton boutique.
        </p>
      </header>

      <div className="stores-single-layout">
        {/* Left Column: Official Store Info Card & Visual Gallery */}
        <div className="store-main-column">
          <div className="store-card store-card-hero">
            <div className="store-pin-badge">
              <PinIcon />
            </div>
            <div className="store-info-content">
              <div className="store-badge-pill">OFFICIAL STORE LOCATION</div>
              <h2>{store.name}</h2>
              <div className="store-full-address">
                <p><strong>{store.mall}</strong></p>
                <p>{store.street}</p>
                <p>{store.city}, {store.postcode}</p>
                <p>{store.country}</p>
              </div>

              <div className="store-meta-grid">
                <div>
                  <span className="store-meta-label">Telephone:</span>
                  <a href={`tel:${store.phone.replace(/\s+/g, '')}`} className="store-meta-val link">
                    {store.phone}
                  </a>
                </div>
                <div>
                  <span className="store-meta-label">Direct Email:</span>
                  <a href={`mailto:${store.email}`} className="store-meta-val link">
                    {store.email}
                  </a>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="store-meta-label">Opening Hours:</span>
                  <span className="store-meta-val">{store.hours}</span>
                </div>
              </div>

              <p className="store-highlights">
                <em>{store.highlights}</em>
              </p>

              <div className="store-action-buttons">
                <a
                  href={store.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  Open in Google Maps ↗
                </a>
                <Link to="/pages/contact" className="btn ghost">
                  Contact Boutique Concierge
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Showcase Gallery (filling the former mock stores space) */}
          <div className="store-gallery-section">
            <div className="store-gallery-head">
              <h3>In-Store Experience &amp; Boutique Gallery</h3>
              <p className="muted small">Explore the ambiance and fragrance collections waiting for you in store.</p>
            </div>
            <div className="store-gallery-grid">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="store-gallery-card">
                  <div className="store-gallery-img-wrap">
                    <img src={img.url} alt={img.title} loading="lazy" />
                  </div>
                  <div className="store-gallery-caption">
                    <h4>{img.title}</h4>
                    <p>{img.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visitor Guide & Map Card */}
        <div className="store-sidebar-column">
          <div className="store-map-box">
            <div className="map-visual-placeholder">
              <PinIcon />
              <h3>Visit Us in Southampton</h3>
              <p className="muted">
                Located conveniently inside the <strong>Marlands Shopping Centre</strong> on Civic Centre Road. Walk-ins are always warmly welcomed.
              </p>
              <div className="store-perks-list">
                <div className="perk-item">
                  <CheckIcon />
                  <span>100% Guaranteed Authentic Dubai Houses</span>
                </div>
                <div className="perk-item">
                  <CheckIcon />
                  <span>Complimentary Scent Layering Profiling</span>
                </div>
                <div className="perk-item">
                  <CheckIcon />
                  <span>Same-Day Click &amp; Collect Service</span>
                </div>
              </div>
              <a
                href={store.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn wide"
                style={{ marginTop: 18 }}
              >
                Get Directions to Unit 38 ↗
              </a>
            </div>
          </div>

          <div className="store-consult-box">
            <ShieldIcon />
            <h4>Private Scent Session</h4>
            <p className="muted small">
              Planning a special occasion or seeking a bespoke signature oud? Book a complimentary 1-on-1 consultation with our master fragrance consultants.
            </p>
            <Link to="/pages/contact" className="link" style={{ fontWeight: 600 }}>
              Book an Appointment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
