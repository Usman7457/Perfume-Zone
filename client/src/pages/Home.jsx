import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts, getSiteContent } from '../api.js';
import Carousel from '../components/Carousel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { TruckIcon, ShieldIcon, LockIcon } from '../components/Icons.jsx';

const DEFAULT_HERO = [
  {
    to: '/collections/all',
    title: 'Arabian Luxury & Rare Oud',
    subtitle: 'Authentic extrait concentrations crafted for enduring elegance.',
    cta: 'Explore All Scents',
    bg: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=80'
  },
  {
    to: '/collections/oud-elixir',
    title: 'Oud Elixir Dubai Collection',
    subtitle: 'Opulent Cambodian agarwood, Bulgarian rose & rich amber.',
    cta: 'Discover Oud Elixir',
    bg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80'
  },
  {
    to: '/pages/perfume-offers',
    title: 'Special Introductory Offers',
    subtitle: '10% off your entire order with code PERFUME10 + Free UK delivery over £50.',
    cta: 'View Exclusive Deals',
    bg: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1600&q=80'
  }
];

const FEATURED_BRANDS = [
  { name: 'Oud Elixir', handle: 'oud-elixir', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Afnan Perfumes', handle: 'afnan', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Lattafa Luxury', handle: 'lattafa', img: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Swiss Arabian', handle: 'swiss-arabian', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80' },
  { name: 'Zimaya', handle: 'zimaya', img: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rayhaan', handle: 'rayhaan', img: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=600&q=80' }
];

const FAMILIES = [
  { name: 'Precious Oud', handle: 'oud-1', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rich Amber', handle: 'amber', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sweet Gourmand', handle: 'gourmand', img: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Noble Woods', handle: 'woody', img: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sensual Floral', handle: 'floral', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80' }
];

function Hero({ slides }) {
  const [i, setI] = useState(0);
  const heroList = slides && slides.length ? slides : DEFAULT_HERO;

  useEffect(() => {
    if (i >= heroList.length) setI(0);
  }, [heroList.length, i]);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % heroList.length), 6500);
    return () => clearInterval(t);
  }, [heroList.length]);

  const s = heroList[i] || heroList[0];

  return (
    <section className="hero" aria-roledescription="carousel">
      <div className="hero-slide">
        <img
          src={s.bg}
          alt={s.title}
          className="hero-image-layer"
          width="1600"
          height="900"
          loading="eager"
          decoding="async"
          fetchPriority={i === 0 ? 'high' : 'auto'}
        />
        <div className="hero-overlay-tint" />
        <div className="hero-copy">
          <span className="hero-eyebrow">PERFUME ZONE UK</span>
          <h1>{s.title}</h1>
          <p className="hero-subtitle">{s.subtitle}</p>
          <Link to={s.to || s.ctaLink || '/collections/all'} className="btn light hero-cta-btn">
            {s.cta || s.ctaText || 'Explore All Scents'}
          </Link>
        </div>
      </div>
      <div className="hero-ctl">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setI((i + heroList.length - 1) % heroList.length)}
        >
          ‹
        </button>
        {heroList.map((_, n) => (
          <button
            key={n}
            type="button"
            className={'dot' + (n === i ? ' on' : '')}
            aria-label={`Go to slide ${n + 1}`}
            onClick={() => setI(n)}
          />
        ))}
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setI((i + 1) % heroList.length)}
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [homeData, setHomeData] = useState(() => getSiteContent().home || {});

  useEffect(() => {
    const onContentChange = (e) => {
      if (e.detail?.home) {
        setHomeData(e.detail.home);
      } else {
        setHomeData(getSiteContent().home || {});
      }
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  useEffect(() => {
    let ignore = false;
    getProducts({ limit: 12 })
      .then((r) => {
        if (!ignore && r?.products) setItems(r.products);
      })
      .catch(() => { });
    return () => {
      ignore = true;
    };
  }, []);

  const middleBanner = homeData.middleBanner || {};
  const trustBadges = homeData.trustBadges || [];

  return (
    <>
      <Hero slides={homeData.heroSlides} />

      {/* Featured Collection: New Arrivals */}
      <section className="section">
        <div className="section-head-center">
          <span className="eyebrow">NEW RELEASES</span>
          <h2 className="section-title">New Releases &amp; Latest Arrivals</h2>
          <p className="section-sub">
            The freshest creations from the prestigious fragrance laboratories of Dubai and Europe.
          </p>
        </div>

        <Carousel>
          {items.length ? (
            items.map((p) => (
              <div className="slide" key={p.id}>
                <ProductCard p={p} />
              </div>
            ))
          ) : (
            <p className="empty">Gathering perfumes...</p>
          )}
        </Carousel>

        <div className="center">
          <Link to="/collections/new-releases" className="btn ghost">
            View All New Releases
          </Link>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="section tinted">
        <div className="section-head-center">
          <span className="eyebrow">EXCLUSIVE HOUSES</span>
          <h2 className="section-title">The Brands You Want Most</h2>
          <p className="section-sub">
            Authentic collections from world-renowned perfumers, backed by <strong>perfumezone.uk</strong> provenance guarantee.
          </p>
        </div>

        <Carousel>
          {FEATURED_BRANDS.map((b) => (
            <Link key={b.handle} to={'/collections/' + b.handle} className="slide tile brand-tile">
              <div
                className="tile-media"
                style={{ backgroundImage: `url(${b.img})` }}
              />
              <span className="tile-title">{b.name}</span>
            </Link>
          ))}
        </Carousel>
      </section>

      {/* Fragrance Families */}
      <section className="section">
        <div className="section-head-center">
          <span className="eyebrow">EXPLORE BY ACCORD</span>
          <h2 className="section-title">Fragrance Families</h2>
          <p className="section-sub">
            From smoky oud and warm amber accords to gourmand sweet vanillas and vibrant citrus.
          </p>
        </div>

        <Carousel>
          {FAMILIES.map((f) => (
            <Link key={f.handle} to={'/collections/' + f.handle} className="slide tile family-tile">
              <div
                className="tile-media"
                style={{ backgroundImage: `url(${f.img})` }}
              />
              <span className="tile-title">{f.name}</span>
            </Link>
          ))}
        </Carousel>
      </section>

      {/* Special Offer Banner */}
      <section
        className="home-promo-banner"
        style={middleBanner.bg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.7)), url(${middleBanner.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="promo-banner-inner">
          <span className="promo-pill">LIMITED TIME PROMOTION</span>
          <h2>{middleBanner.title || 'Experience Arabian Splendour with 10% Off'}</h2>
          <p>
            {middleBanner.subtitle || 'Use discount coupon PERFUME10 at checkout and enjoy complimentary UK Tracked Delivery on all orders over £50.'}
          </p>
          <div className="promo-banner-cta">
            <Link to={middleBanner.to || '/pages/perfume-offers'} className="btn light">
              {middleBanner.cta || 'Discover Exclusive Offers'}
            </Link>
            <Link to="/collections/all" className="btn ghost light-ghost">
              Explore All Perfumes
            </Link>
          </div>
        </div>
      </section>

      {/* Trust USPs */}
      <section className="usps home-usps">
        {trustBadges && trustBadges.length > 0 ? (
          trustBadges.map((badge, idx) => (
            <div key={badge.id || idx} className="usp-block">
              {badge.icon === 'shield' ? <ShieldIcon /> : badge.icon === 'lock' ? <LockIcon /> : <TruckIcon />}
              <strong>{(badge.title || '').toUpperCase()}</strong>
              <span>{badge.desc}</span>
            </div>
          ))
        ) : (
          <>
            <div className="usp-block">
              <TruckIcon />
              <strong>FREE UK DELIVERY OVER £50</strong>
              <span>Royal Mail Tracked 48 &amp; Tracked 24</span>
            </div>
            <div className="usp-block">
              <ShieldIcon />
              <strong>100% AUTHENTIC GUARANTEE</strong>
              <span>Direct from official manufacturer sources</span>
            </div>
            <div className="usp-block">
              <LockIcon />
              <strong>SECURE PAYMENT &amp; SUPPORT</strong>
              <span>London fragrance concierge team ready to help</span>
            </div>
          </>
        )}
      </section>
    </>
  );
}
