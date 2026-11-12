import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getSiteSettings } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Offers() {
  const [saleItems, setSaleItems] = useState([]);
  const [settings, setSettings] = useState(() => getSiteSettings());
  const [copied, setCopied] = useState(false);

  const loadProducts = () => {
    getProducts({ limit: 12 }).then((r) => {
      if (!r?.products) return;
      const discounted = r.products.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
      setSaleItems(discounted.length ? discounted : r.products.slice(0, 8));
    }).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    const syncSettings = () => setSettings(getSiteSettings());
    window.addEventListener('pz:settings-change', syncSettings);
    window.addEventListener('pz:products-change', loadProducts);
    return () => {
      window.removeEventListener('pz:settings-change', syncSettings);
      window.removeEventListener('pz:products-change', loadProducts);
    };
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeCode = settings.promoCode || 'PERFUME10';

  return (
    <div className="container offers-page">
      <header className="page-header center">
        <span className="eyebrow">EXCLUSIVE DEALS &amp; PROMOTIONS</span>
        <h1>{settings.offersHeadline || 'Perfume Zone Special Offers'}</h1>
        <p className="muted max-prose">
          {settings.offersSubheadline ||
            'Experience world-class Arabian fragrances with our current promotions, complimentary gifts, and limited-time savings at perfumezone.uk.'}
        </p>
      </header>

      {/* Promotions Cards Grid */}
      <div className="offers-deals-grid">
        <div className="offer-deal-card highlighted">
          <span className="deal-pill">NEW CUSTOMER SPECIAL</span>
          <h3>{settings.promoTitle || '10% Off Your Entire Order'}</h3>
          <p className="muted">
            {settings.promoDescription ||
              'Enjoy 10% off your entire first purchase across all collections with no minimum spend required.'}
          </p>
          <div className="promo-code-box">
            <code>{activeCode}</code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => copyCode(activeCode)}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <div className="offer-deal-card">
          <span className="deal-pill">DELIVERY BENEFIT</span>
          <h3>Free UK Delivery Over £50</h3>
          <p className="muted">Automatic free Royal Mail Tracked 48 delivery applied at checkout whenever your cart reaches £50 or more.</p>
          <div className="deal-status-text">
            ✓ Automatically applied at checkout
          </div>
        </div>

        <div className="offer-deal-card">
          <span className="deal-pill">VIP COMPLIMENTARY GIFT</span>
          <h3>Free Discovery Sample Set</h3>
          <p className="muted">Spend £75 or more and receive two complimentary 2ml luxury Arabian discovery perfume vials with your package.</p>
          <div className="deal-status-text">
            ✓ Included with every qualifying order
          </div>
        </div>
      </div>

      {/* Sale Products Showcase */}
      <section className="offers-products-section">
        <div className="section-head-flex">
          <div>
            <h2>Featured Fragrance Reductions</h2>
            <p className="muted">Indulge in selected luxury creations at exceptional introductory prices.</p>
          </div>
          <Link to="/collections/all" className="link">View All Products →</Link>
        </div>

        <div className="grid">
          {saleItems.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
