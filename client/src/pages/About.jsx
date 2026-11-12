import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container about-page">
      <header className="page-header center">
        <span className="eyebrow">OUR HERITAGE &amp; PASSION</span>
        <h1>Welcome to Perfume Zone</h1>
        <p className="lead-text max-prose">
          Born from an obsession with rare aromas and rich Arabian heritage, Perfume Zone brings the world's most evocative fragrances directly to fragrance lovers across the United Kingdom.
        </p>
      </header>

      <div className="about-hero-image-box">
        <img
          src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1400&q=80"
          alt="Perfume Zone Luxury Collection"
          className="about-hero-banner"
        />
      </div>

      <div className="about-story-content">
        <div className="prose about-story-text">
          <h2>The Perfume Zone Story</h2>
          <p>
            At <strong>Perfume Zone</strong> (<a href="https://perfumezone.uk">perfumezone.uk</a>), we believe that fragrance is not merely an accessory; it is an intimate expression of individuality, memory, and presence. Founded in the United Kingdom, our mission started with a clear vision: to bridge the gap between historic perfume houses in Dubai, Oman, and Grasse, and the discerning fragrance enthusiasts of the UK.
          </p>
          <p>
            From the deep, resinous allure of Cambodian and Hindi Agarwood (Oud) to the delicate sweetness of Taif Roses, warm ambergris, and delectable gourmand notes, our curation represents the pinnacle of oriental and modern niche perfumery.
          </p>
        </div>

        <div className="about-values-grid">
          <div className="value-card">
            <h3>100% Genuine Authenticity</h3>
            <p>Every single bottle in our catalog is sourced directly from original manufacturers and authorized distributors. We guarantee absolute authenticity with batch codes and proof of provenance.</p>
          </div>
          <div className="value-card">
            <h3>Artisanal Extrait Concentrations</h3>
            <p>We champion high-concentration formulations—Extrait De Parfum and Eau De Parfum—ensuring remarkable longevity, projection, and depth that evolve on skin throughout the day.</p>
          </div>
          <div className="value-card">
            <h3>Curated Scent Wardrobe</h3>
            <p>Whether you seek a signature daily office fragrance, a sultry evening oud, or a fresh summer breeze accord, our team selects each creation for its outstanding artistic merit.</p>
          </div>
        </div>

        <div className="prose about-story-text">
          <h2>Direct UK Dispatch &amp; Concierge Care</h2>
          <p>
            Operating from our central logistics hub in London, all orders placed on <strong>perfumezone.uk</strong> are carefully packaged in luxury protective cases to ensure pristine delivery to your doorstep. We are proud to offer free standard delivery across the United Kingdom on orders over £50.
          </p>
        </div>

        <div className="about-cta-banner">
          <h3>Discover Your New Signature Fragrance</h3>
          <p>Explore our latest arrivals, bestsellers, and exclusive private blends today.</p>
          <div className="about-cta-buttons">
            <Link to="/collections/all" className="btn light">Shop The Collection</Link>
            <Link to="/pages/contact-us" className="btn ghost light-ghost">Speak with an Advisor</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
