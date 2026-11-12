import { Link } from 'react-router-dom';
import { useWishlist } from '../components/WishlistContext.jsx';
import { useCart } from '../components/CartContext.jsx';
import { money } from '../api.js';
import { TrashIcon, BagIcon, HeartIcon } from '../components/Icons.jsx';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { add } = useCart();

  if (!wishlist.length) {
    return (
      <div className="container center empty-wishlist-page">
        <div className="wishlist-icon-large">
          <HeartIcon />
        </div>
        <h1>Your Wishlist is Empty</h1>
        <p className="muted">
          Explore our signature fragrances and click the heart icon on any perfume to save your favorites here.
        </p>
        <div className="empty-actions">
          <Link to="/collections/all" className="btn">
            Explore All Perfumes
          </Link>
          <Link to="/collections/best-sellers" className="btn ghost">
            View Best Sellers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p className="muted">
            {wishlist.length} saved {wishlist.length === 1 ? 'fragrance' : 'fragrances'}
          </p>
        </div>
        <button className="btn ghost clear-wishlist-btn" onClick={clearWishlist}>
          Clear All
        </button>
      </div>

      <div className="grid">
        {wishlist.map((p) => (
          <article key={p.id} className="card wishlist-card">
            <div className="card-media-wrapper">
              <Link to={'/products/' + p.handle} className="card-img">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} loading="lazy" />
                ) : (
                  <div className="ph" />
                )}
              </Link>
              <button
                className="card-wish-btn active"
                title="Remove from wishlist"
                onClick={() => removeFromWishlist(p.id)}
              >
                <TrashIcon />
              </button>
            </div>

            <div className="card-details">
              {p.brand && <span className="card-brand">{p.brand}</span>}
              <Link to={'/products/' + p.handle} className="card-title">
                {p.title}
              </Link>
              <div className="card-price">
                {p.compare_at_price && <s>{money(p.compare_at_price)}</s>}
                <strong>{money(p.price)}</strong>
              </div>

              <button
                className="btn wide add-from-wishlist-btn"
                onClick={() => add(p, 1)}
              >
                <BagIcon /> Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
