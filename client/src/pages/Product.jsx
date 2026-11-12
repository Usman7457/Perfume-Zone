import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProduct, getProducts, money } from '../api.js';
import { useCart } from '../components/CartContext.jsx';
import { useWishlist } from '../components/WishlistContext.jsx';
import { HeartIcon, BagIcon, ShieldIcon, TruckIcon, LockIcon } from '../components/Icons.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Product() {
  const { handle } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [err, setErr] = useState(false);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [related, setRelated] = useState([]);

  const { add } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let ignore = false;
    setP(null);
    setErr(false);
    setImg(0);
    setQty(1);

    getProduct(handle)
      .then((product) => {
        if (!ignore) {
          setP(product);
          // Load related items
          getProducts({ limit: 6 })
            .then((r) => {
              if (!ignore && r.products) {
                setRelated(r.products.filter((item) => item.id !== product.id).slice(0, 4));
              }
            })
            .catch(() => { });
        }
      })
      .catch(() => {
        if (!ignore) setErr(true);
      });

    return () => {
      ignore = true;
    };
  }, [handle]);

  if (err) {
    return (
      <div className="container center empty-product-page">
        <h1>Fragrance Not Found</h1>
        <p className="muted">The perfume you are looking for is currently unavailable or may have moved.</p>
        <Link to="/collections/all" className="btn">Browse All Fragrances</Link>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container center loading-product-page">
        <p className="empty">Loading fragrance details…</p>
      </div>
    );
  }

  const isWish = isInWishlist(p.id);
  const imgs = [p.image_url, p.image_url_2].filter(Boolean);

  const handleBuyNow = () => {
    add(p, qty);
    nav('/checkout');
  };

  const discountPercent =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;

  return (
    <div className="container pdp-page">
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/collections/all">Fragrances</Link>
        <span>/</span>
        {p.brand && (
          <>
            <Link to={'/collections/' + p.brand.toLowerCase().replace(/\s+/g, '-')}>{p.brand}</Link>
            <span>/</span>
          </>
        )}
        <span className="current">{p.title}</span>
      </nav>

      <div className="pdp">
        {/* Gallery */}
        <div className="gallery">
          <div className="gallery-main">
            {imgs[img] ? (
              <img src={imgs[img]} alt={p.title} />
            ) : (
              <div className="ph" />
            )}
            {discountPercent && (
              <span className="pdp-sale-tag">SAVE {discountPercent}%</span>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="thumbs">
              {imgs.map((s, n) => (
                <button
                  key={s}
                  type="button"
                  className={n === img ? 'on' : ''}
                  onClick={() => setImg(n)}
                >
                  <img src={s} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="info">
          {p.brand && <div className="pdp-brand-tag">{p.brand}</div>}
          <h1 className="pdp-title">{p.title}</h1>

          <div className="pdp-price-row">
            {p.compare_at_price && <s>{money(p.compare_at_price)}</s>}
            <span className="pdp-current-price">{money(p.price)}</span>
            <span className="vat-pill">Includes UK VAT</span>
          </div>

          <div className="pdp-size-row">
            <span className="size-label">Volume &amp; Concentration:</span>
            <strong className="size-value">{p.size || '100ml Eau De Parfum'}</strong>
          </div>

          <div className="stock-status-row">
            <span className="stock-dot" />
            <span>In Stock — Dispatched within 24 hours from London</span>
          </div>

          {/* Quantity and Action Buttons */}
          <div className="buy pdp-actions-group">
            <div className="qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn wide pdp-add-btn"
              disabled={!p.in_stock}
              onClick={() => add(p, qty)}
            >
              <BagIcon /> {p.in_stock ? 'Add to Shopping Bag' : 'Sold Out'}
            </button>

            <button
              type="button"
              className={'pdp-wishlist-toggle-btn' + (isWish ? ' active' : '')}
              aria-label={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
              onClick={() => toggleWishlist(p)}
            >
              <HeartIcon filled={isWish} />
            </button>
          </div>

          {/* Instant Buy Now Button */}
          {p.in_stock !== 0 && (
            <button
              type="button"
              className="btn light wide pdp-buy-now-btn"
              onClick={handleBuyNow}
            >
              Instant Buy Now (Fast Checkout)
            </button>
          )}

          {/* Trust Highlights */}
          <div className="pdp-trust-grid">
            <div className="trust-pill">
              <TruckIcon /> Free UK Delivery over £50
            </div>
            <div className="trust-pill">
              <ShieldIcon /> 100% Guaranteed Authentic
            </div>
            <div className="trust-pill">
              <LockIcon /> Secure Payment Gateway
            </div>
          </div>

          {/* Details Accordion */}
          <div className="pdp-details-list">
            <details open>
              <summary>Fragrance Description</summary>
              <div className="details-content">
                <p>{p.description}</p>
              </div>
            </details>

            {p.notes && (
              <details open>
                <summary>Olfactory Pyramid &amp; Notes</summary>
                <div className="details-content olfactory-pyramid">
                  <div className="note-tier">
                    <strong>Top Notes:</strong>
                    <span>{p.notes.top}</span>
                  </div>
                  <div className="note-tier">
                    <strong>Heart / Middle Notes:</strong>
                    <span>{p.notes.middle}</span>
                  </div>
                  <div className="note-tier">
                    <strong>Base Notes:</strong>
                    <span>{p.notes.base}</span>
                  </div>
                </div>
              </details>
            )}

            <details>
              <summary>Shipping &amp; Free UK Returns</summary>
              <div className="details-content">
                <p>
                  Dispatched in insulated protective perfume packaging. We provide Royal Mail Tracked 48 and Tracked 24 options. Free 14-day returns on unopened, factory-sealed flacons.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Related Fragrances */}
      {related.length > 0 && (
        <section className="pdp-related-section">
          <div className="section-head-row">
            <h2>You May Also Admire</h2>
            <Link to="/collections/all" className="link">View Catalog →</Link>
          </div>
          <div className="grid">
            {related.map((item) => (
              <ProductCard key={item.id} p={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
