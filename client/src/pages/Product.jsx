import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProduct, getProducts, money, COLLECTION_META } from '../api.js';
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

  const inStock = p.in_stock !== 0 && p.in_stock !== false;
  const stockQty = p.stock_quantity != null ? Number(p.stock_quantity) : (inStock ? 15 : 0);
  const isLowStock = inStock && stockQty > 0 && stockQty <= 5;
  const isOutOfStock = !inStock || stockQty === 0;
  const sku = p.sku || ('PZ-' + String(p.id || 1).padStart(4, '0') + (p.brand ? '-' + p.brand.slice(0, 3).toUpperCase() : ''));
  const categoriesList = (p.collections || '')
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((handle) => ({
      handle,
      title: COLLECTION_META[handle]?.title || handle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }));

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

          <div className={`stock-status-row ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
            <span className="stock-dot" />
            {isOutOfStock ? (
              <span>Out of Stock — Currently sold out</span>
            ) : isLowStock ? (
              <span>Low Stock — Only <strong>{stockQty}</strong> left in stock (order soon)</span>
            ) : (
              <span>In Stock (<strong>{stockQty}</strong> units available) — Dispatched within 24 hours from London</span>
            )}
          </div>

          {/* Quantity and Action Buttons - All in 1 Row */}
          <div className="buy pdp-actions-group">
            <div className="qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={isOutOfStock}
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span>{isOutOfStock ? 0 : qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={isOutOfStock || (stockQty > 0 && qty >= stockQty)}
                onClick={() => setQty(stockQty > 0 ? Math.min(stockQty, qty + 1) : qty + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn pdp-add-btn"
              disabled={isOutOfStock}
              onClick={() => add(p, qty)}
            >
              <BagIcon /> {!isOutOfStock ? 'Add to Bag' : 'Sold Out'}
            </button>

            {!isOutOfStock && (
              <button
                type="button"
                className="btn pdp-buy-now-btn"
                onClick={handleBuyNow}
              >
                Instant Buy
              </button>
            )}

            <button
              type="button"
              className={'pdp-wishlist-toggle-btn' + (isWish ? ' active' : '')}
              aria-label={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
              title={isWish ? 'Saved in Wishlist' : 'Add to Wishlist'}
              onClick={() => toggleWishlist(p)}
            >
              <HeartIcon filled={isWish} />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pdp-trust-grid">
            <div className="trust-pill">
              <TruckIcon />
              <span>Free UK Delivery over £50</span>
            </div>
            <div className="trust-pill">
              <ShieldIcon />
              <span>100% Guaranteed Authentic</span>
            </div>
            <div className="trust-pill">
              <LockIcon />
              <span>Secure Payment Gateway</span>
            </div>
          </div>

          {/* WordPress / WooCommerce Style Product Meta */}
          <div className="product-meta">
            <div className="product-meta-item">
              <span className="product-meta-label">SKU:</span>
              <span className="product-meta-value sku-badge">{sku}</span>
            </div>
            <div className="product-meta-item">
              <span className="product-meta-label">Availability:</span>
              <span className={`product-meta-value stock-pill ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
                <span className="stock-dot" />
                {isOutOfStock ? 'Out of stock' : isLowStock ? `Low stock (${stockQty} units)` : `In stock (${stockQty} units)`}
              </span>
            </div>
            {p.brand && (
              <div className="product-meta-item">
                <span className="product-meta-label">Brand:</span>
                <span className="product-meta-value product-meta-links">
                  <Link to={'/collections/' + p.brand.toLowerCase().replace(/\s+/g, '-')}>
                    {p.brand}
                  </Link>
                </span>
              </div>
            )}
            {categoriesList.length > 0 && (
              <div className="product-meta-item">
                <span className="product-meta-label">Categories:</span>
                <span className="product-meta-value product-meta-links">
                  {categoriesList.map((cat, idx) => (
                    <span key={cat.handle}>
                      <Link to={'/collections/' + cat.handle}>{cat.title}</Link>
                      {idx < categoriesList.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Details Accordion (Closed by default - opens on user click) */}
          <div className="pdp-details-list">
            <details>
              <summary>Fragrance Description</summary>
              <div className="details-content">
                <p>{p.description}</p>
              </div>
            </details>

            {p.notes && (
              <details>
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
