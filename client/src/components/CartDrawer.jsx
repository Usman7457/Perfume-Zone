import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext.jsx';
import { money } from '../api.js';
import { CloseIcon, TrashIcon, TruckIcon } from './Icons.jsx';

export default function CartDrawer() {
  const { items, setQty, removeItem, subtotal, total, discount, open, setOpen, freeShippingThreshold } = useCart();
  const nav = useNavigate();

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const proceedToCheckout = () => {
    setOpen(false);
    nav('/checkout');
  };

  return (
    <>
      <div
        className={'drawer-overlay' + (open ? ' show' : '')}
        onClick={() => setOpen(false)}
      />
      <aside
        className={'drawer right' + (open ? ' show' : '')}
        aria-hidden={!open}
      >
        <div className="drawer-head">
          <h3>Your Bag ({items.reduce((s, i) => s + i.qty, 0)})</h3>
          <button
            className="icon-btn"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="drawer-shipping-meter">
          <div className="meter-label">
            <TruckIcon />
            {remainingForFreeShipping > 0 ? (
              <span>Add <strong>{money(remainingForFreeShipping)}</strong> more for <strong>Free UK Delivery</strong></span>
            ) : (
              <span className="meter-unlocked">You have qualified for <strong>Free UK Delivery!</strong></span>
            )}
          </div>
          <div className="meter-bar">
            <div className="meter-fill" style={{ width: `${freeShippingProgress}%` }} />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart-drawer">
            <p className="empty">Your shopping bag is empty.</p>
            <Link
              className="btn"
              to="/collections/new-in"
              onClick={() => setOpen(false)}
            >
              Explore New Fragrances
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {items.map((i) => (
                <li key={i.id}>
                  <div className="thumb">
                    {i.image ? (
                      <img src={i.image} alt={i.title} />
                    ) : (
                      <div className="ph" />
                    )}
                  </div>
                  <div className="cart-line-info">
                    {i.brand && <div className="cart-line-brand">{i.brand}</div>}
                    <Link
                      to={'/products/' + i.handle}
                      className="cart-line-title"
                      onClick={() => setOpen(false)}
                    >
                      {i.title}
                    </Link>
                    <div className="cart-line-size">{i.size || '100ml'}</div>
                    <div className="cart-line-price">{money(i.price)}</div>

                    <div className="cart-line-actions">
                      <div className="qty">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(i.id, i.qty - 1)}
                        >
                          −
                        </button>
                        <span>{i.qty}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(i.id, i.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-remove-btn"
                        aria-label="Remove item"
                        onClick={() => removeItem(i.id)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="drawer-foot">
              <div className="row subtotal-row">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="row discount-row">
                  <span>Discount</span>
                  <span className="discount-val">−{money(discount)}</span>
                </div>
              )}
              <p className="muted foot-note">
                Taxes, shipping discounts & promo codes calculated at checkout.
              </p>

              <div className="drawer-actions">
                <button
                  className="btn wide primary-checkout"
                  onClick={proceedToCheckout}
                >
                  Proceed to Checkout • {money(total)}
                </button>
                <Link
                  className="btn ghost wide"
                  to="/cart"
                  onClick={() => setOpen(false)}
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
