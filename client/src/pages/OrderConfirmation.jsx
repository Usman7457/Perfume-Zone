import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getOrderById, money } from '../api.js';
import { CheckIcon, TruckIcon, ShieldIcon } from '../components/Icons.jsx';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    if (!order && id) {
      Promise.resolve(getOrderById(id)).then((found) => {
        if (found) setOrder(found);
      });
    }
  }, [id, order]);

  if (!order) {
    return (
      <div className="container center confirmation-empty">
        <h1>Order Confirmation</h1>
        <p className="muted">Looking up your order details or order reference #{id}...</p>
        <Link to="/" className="btn">Return to Perfume Zone Home</Link>
      </div>
    );
  }

  const {
    id: orderId,
    customerName,
    email,
    shippingAddress,
    items = [],
    subtotal,
    shippingCost,
    discount,
    total,
    paymentMethod,
    createdAt
  } = order;

  return (
    <div className="container narrow order-confirmation-page">
      <div className="confirmation-badge-wrapper">
        <div className="confirmation-icon-circle">
          <CheckIcon />
        </div>
        <span className="confirmation-eyebrow">Thank You for Your Order!</span>
        <h1>Order Confirmed #{orderId}</h1>
        <p className="confirmation-subtext">
          A confirmation receipt has been sent to <strong>{email}</strong>. We're carefully preparing your luxury fragrances for dispatch.
        </p>
      </div>

      {/* Tracker Steps */}
      <div className="order-tracker">
        <div className="tracker-step completed">
          <div className="step-dot" />
          <span>Order Placed</span>
        </div>
        <div className="tracker-step active">
          <div className="step-dot" />
          <span>Quality Check</span>
        </div>
        <div className="tracker-step">
          <div className="step-dot" />
          <span>Dispatched</span>
        </div>
        <div className="tracker-step">
          <div className="step-dot" />
          <span>Delivered</span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="order-receipt-card">
        <h3>Order Details</h3>
        <p className="order-date-text">
          Placed on {new Date(createdAt || Date.now()).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>

        <ul className="receipt-items-list">
          {items.map((i, idx) => (
            <li key={idx} className="receipt-item-row">
              <div className="receipt-thumb">
                {i.image ? <img src={i.image} alt={i.title} /> : <div className="ph" />}
              </div>
              <div className="receipt-item-info">
                <strong>{i.title}</strong>
                <span className="muted">{i.size || '100ml'} • Qty: {i.qty}</span>
                {i.brand && <span className="muted brand-tag">{i.brand}</span>}
              </div>
              <div className="receipt-item-price">
                {money(i.price * i.qty)}
              </div>
            </li>
          ))}
        </ul>

        <div className="receipt-totals-breakdown">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="totals-row discount">
              <span>Discount</span>
              <span>−{money(discount)}</span>
            </div>
          )}
          <div className="totals-row">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'FREE' : money(shippingCost)}</span>
          </div>
          <div className="totals-row grand-total">
            <strong>Total Paid</strong>
            <strong>{money(total)}</strong>
          </div>
        </div>

        <div className="order-shipping-summary">
          <h4>Delivery Destination</h4>
          <p>
            <strong>{customerName}</strong><br />
            {shippingAddress?.address} {shippingAddress?.apartment && `, ${shippingAddress.apartment}`}<br />
            {shippingAddress?.city}, {shippingAddress?.postcode}<br />
            {shippingAddress?.country}<br />
            {shippingAddress?.phone && <span>Phone: {shippingAddress.phone}</span>}
          </p>

          <h4>Payment Method</h4>
          <p className="payment-type-text">
            {paymentMethod === 'card' && 'Credit / Debit Card (Secure Payment)'}
            {paymentMethod === 'paypal' && 'PayPal Account'}
            {paymentMethod === 'klarna' && 'Klarna (3 Installments)'}
            {paymentMethod === 'cod' && 'Cash on Delivery'}
          </p>
        </div>
      </div>

      <div className="confirmation-actions">
        <button
          type="button"
          className="btn ghost"
          onClick={() => window.print()}
        >
          Print Receipt
        </button>
        <Link to="/collections/all" className="btn">
          Continue Shopping
        </Link>
      </div>

      <div className="confirmation-footer-support">
        <ShieldIcon />
        <p>
          Questions about your order? Contact our UK concierge team at{' '}
          <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a> quoting order reference <strong>#{orderId}</strong>.
        </p>
      </div>
    </div>
  );
}
