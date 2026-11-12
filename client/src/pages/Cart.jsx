import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../components/CartContext.jsx';
import { money } from '../api.js';
import { TrashIcon, TruckIcon, ShieldIcon, LockIcon } from '../components/Icons.jsx';

export default function Cart() {
  const {
    items,
    setQty,
    removeItem,
    subtotal,
    total,
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [orderNote, setOrderNote] = useState('');
  const nav = useNavigate();

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg(res);
    if (res.ok) setCouponCode('');
  };

  if (!items.length) {
    return (
      <div className="container center empty-cart-page">
        <h1>Your Shopping Cart is Empty</h1>
        <p className="muted">
          Looks like you haven't added any luxury perfumes to your bag yet.
        </p>
        <div className="empty-cart-actions">
          <Link className="btn" to="/collections/new-in">
            Explore New In
          </Link>
          <Link className="btn ghost" to="/collections/best-sellers">
            Shop Best Sellers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="cart-header">
        <h1>Shopping Bag</h1>
        <span className="cart-count-pill">
          {items.reduce((s, i) => s + i.qty, 0)} {items.reduce((s, i) => s + i.qty, 0) === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Free Shipping Alert Banner */}
      <div className="cart-shipping-banner">
        <div className="shipping-banner-text">
          <TruckIcon />
          {remainingForFreeShipping > 0 ? (
            <span>
              Add <strong>{money(remainingForFreeShipping)}</strong> more to your order to qualify for <strong>FREE UK Delivery</strong>!
            </span>
          ) : (
            <span className="shipping-qualified">
              Congratulations! Your order qualifies for <strong>FREE UK Delivery</strong>.
            </span>
          )}
        </div>
        <div className="meter-bar">
          <div className="meter-fill" style={{ width: `${freeShippingProgress}%` }} />
        </div>
      </div>

      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-wrapper">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="th-qty">Quantity</th>
                <th className="th-price">Total</th>
                <th className="th-action"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="cart-row">
                  <td className="cart-cell-product">
                    <div className="cart-item-preview">
                      <div className="cart-thumb">
                        {i.image ? (
                          <img src={i.image} alt={i.title} />
                        ) : (
                          <div className="ph" />
                        )}
                      </div>
                      <div className="cart-item-details">
                        {i.brand && <span className="cart-item-brand">{i.brand}</span>}
                        <Link to={'/products/' + i.handle} className="cart-item-title">
                          {i.title}
                        </Link>
                        <span className="cart-item-size">{i.size || '100ml'}</span>
                        <span className="cart-item-unit-price">{money(i.price)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="cart-cell-qty">
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
                  </td>

                  <td className="cart-cell-total">
                    <strong>{money(i.price * i.qty)}</strong>
                  </td>

                  <td className="cart-cell-remove">
                    <button
                      className="remove-btn"
                      aria-label="Remove item"
                      onClick={() => removeItem(i.id)}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Delivery Note */}
          <div className="cart-notes-box">
            <label htmlFor="order-note">
              <strong>Order Notes / Gift Message (Optional):</strong>
            </label>
            <textarea
              id="order-note"
              rows="3"
              placeholder="Special instructions for delivery, or a personalized luxury gift note..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>

          {/* Coupon Code Input */}
          <form className="coupon-form" onSubmit={handleApplyCoupon}>
            <div className="coupon-input-group">
              <input
                type="text"
                placeholder="Promo code (e.g. PERFUME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="submit" className="btn ghost">
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={'coupon-msg ' + (couponMsg.ok ? 'success' : 'error')}>
                {couponMsg.message}
              </p>
            )}
          </form>

          {coupon && (
            <div className="active-coupon-tag">
              <span>Applied: <strong>{coupon.code}</strong> ({coupon.label})</span>
              <button onClick={removeCoupon} aria-label="Remove promo code">×</button>
            </div>
          )}

          <div className="summary-breakdown">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount</span>
                <span className="discount-amount">−{money(discount)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated UK Delivery</span>
              <span>
                {subtotal >= freeShippingThreshold || coupon?.type === 'free_shipping'
                  ? <strong className="free-text">FREE</strong>
                  : '£3.99'}
              </span>
            </div>

            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <strong>{money(total)}</strong>
            </div>
          </div>

          <p className="summary-tax-note">
            Taxes included. Standard UK delivery or next-day options selected at checkout.
          </p>

          <button
            className="btn wide checkout-cta-btn"
            onClick={() => nav('/checkout')}
          >
            Proceed to Checkout
          </button>

          <div className="continue-shopping-link">
            <Link to="/collections/all">← Continue Shopping</Link>
          </div>

          <div className="cart-trust-badges">
            <div className="trust-item">
              <ShieldIcon /> 100% Authentic Luxury Guarantee
            </div>
            <div className="trust-item">
              <LockIcon /> 256-Bit SSL Encrypted Checkout
            </div>
            <div className="trust-item">
              <TruckIcon /> Dispatched from London, UK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
