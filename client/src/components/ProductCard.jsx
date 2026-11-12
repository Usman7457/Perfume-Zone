import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from './CartContext.jsx';
import { useWishlist } from './WishlistContext.jsx';
import { HeartIcon, BagIcon } from './Icons.jsx';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWish = isInWishlist(p.id);

  const discountPercent =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;

  return (
    <article className="card">
      <div className="card-media-wrapper">
        <Link to={'/products/' + p.handle} className="card-img" aria-label={p.title}>
          {p.image_url ? (
            <img src={p.image_url} alt={p.title} loading="lazy" decoding="async" width="400" height="500" />
          ) : (
            <div className="ph" />
          )}
          {p.image_url_2 && (
            <img className="alt" src={p.image_url_2} alt="" loading="lazy" decoding="async" width="400" height="500" />
          )}
        </Link>

        {/* Badges */}
        <div className="card-tags">
          {!p.in_stock && <span className="tag sold-out">Sold Out</span>}
          {discountPercent && <span className="tag sale">-{discountPercent}%</span>}
        </div>

        {/* Wishlist toggle button */}
        <button
          className={'card-wish-btn' + (isWish ? ' active' : '')}
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(p);
          }}
        >
          <HeartIcon filled={isWish} />
        </button>

        {/* Quick add button */}
        {p.in_stock !== 0 && (
          <button
            className="quick-add-btn"
            onClick={(e) => {
              e.preventDefault();
              add(p, 1);
            }}
          >
            <BagIcon /> Quick Add
          </button>
        )}
      </div>

      <div className="card-details">
        {p.brand && <span className="card-brand">{p.brand}</span>}
        <Link to={'/products/' + p.handle} className="card-title">
          {p.title}
        </Link>
        <div className="card-price">
          {p.compare_at_price && <s>{money(p.compare_at_price)}</s>}
          <span className="sr-only">Price:</span>
          <strong>{money(p.price)}</strong>
        </div>
      </div>
    </article>
  );
}
