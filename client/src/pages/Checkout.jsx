import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext.jsx';
import { money, createOrder } from '../api.js';
import { LockIcon, ShieldIcon, TruckIcon, CheckIcon } from '../components/Icons.jsx';

export default function Checkout() {
  const {
    items,
    subtotal,
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    freeShippingThreshold
  } = useCart();
  const nav = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [phone, setPhone] = useState('');

  // Shipping Method
  const isFreeStandard = subtotal >= freeShippingThreshold || coupon?.type === 'free_shipping';
  const [shippingMethod, setShippingMethod] = useState(isFreeStandard ? 'free' : 'standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Calculate shipping cost
  let shippingCost = 3.99;
  if (shippingMethod === 'free' || isFreeStandard) {
    shippingCost = 0;
  } else if (shippingMethod === 'express') {
    shippingCost = 5.99;
  } else if (shippingMethod === 'saturday') {
    shippingCost = 9.99;
  }

  const finalTotal = Math.max(0, subtotal - discount + shippingCost);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = applyCoupon(promoCode);
    setPromoMsg(res);
    if (res.ok) setPromoCode('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !firstName || !lastName || !address || !city || !postcode) {
      setFormError('Please fill in all required shipping address fields.');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvc)) {
      setFormError('Please enter valid payment card details.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        email,
        customerName: `${firstName} ${lastName}`.trim(),
        shippingAddress: {
          firstName,
          lastName,
          address,
          apartment,
          city,
          postcode,
          country,
          phone
        },
        items: items.map((i) => ({
          id: i.id,
          handle: i.handle,
          title: i.title,
          brand: i.brand,
          size: i.size,
          price: i.price,
          qty: i.qty,
          image: i.image
        })),
        shippingMethod,
        shippingCost,
        subtotal,
        discount,
        couponCode: coupon?.code || null,
        total: finalTotal,
        paymentMethod,
        newsletter
      };

      const newOrder = await createOrder(orderPayload);
      clearCart();
      nav('/order-confirmation/' + newOrder.id, { state: { order: newOrder } });
    } catch (err) {
      console.error(err);
      setFormError('An error occurred while creating your order. Please try again.');
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="container center empty-checkout">
        <h2>Your Cart is Empty</h2>
        <p className="muted">There are no items to check out.</p>
        <Link to="/collections/all" className="btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Checkout Brand Header */}
      <header className="checkout-header">
        <Link to="/" className="checkout-logo">
          <span className="logo-mark">PERFUME ZONE</span>
          <span className="logo-sub">perfumezone.uk</span>
        </Link>
        <div className="checkout-secure-badge">
          <LockIcon /> Secure SSL Checkout
        </div>
      </header>

      <div className="checkout-grid">
        {/* Left Column: Form Details */}
        <div className="checkout-main">
          {formError && <div className="checkout-error-banner">{formError}</div>}

          {/* Express Checkout */}
          <div className="express-checkout-box">
            <span className="express-title">Express Checkout</span>
            <div className="express-buttons">
              <button
                type="button"
                className="express-btn shop-pay"
                onClick={() => alert('Express Checkout with Shop Pay is simulated. Please fill in the details below.')}
              >
                Shop Pay
              </button>
              <button
                type="button"
                className="express-btn g-pay"
                onClick={() => alert('Express Checkout with GPay is simulated. Please fill in the details below.')}
              >
                Google Pay
              </button>
              <button
                type="button"
                className="express-btn apple-pay"
                onClick={() => alert('Express Checkout with Apple Pay is simulated. Please fill in the details below.')}
              >
                Apple Pay
              </button>
            </div>
            <div className="or-divider">
              <span>OR CONTINUE BELOW</span>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="checkout-form">
            {/* Step 1: Contact Information */}
            <section className="checkout-section">
              <div className="section-head-row">
                <h3>1. Contact Information</h3>
                <Link to="/account" className="login-hint">
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="form-group">
                <label htmlFor="checkout-email">Email Address *</label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  placeholder="e.g. name@example.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
                <span>Email me with exclusive Perfume Zone launches and member offers</span>
              </label>
            </section>

            {/* Step 2: Shipping Address */}
            <section className="checkout-section">
              <h3>2. Shipping Address</h3>

              <div className="form-group">
                <label htmlFor="checkout-country">Country / Region *</label>
                <select
                  id="checkout-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Spain">Spain</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label htmlFor="first-name">First Name *</label>
                  <input
                    id="first-name"
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last Name *</label>
                  <input
                    id="last-name"
                    required
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="checkout-address">Address *</label>
                <input
                  id="checkout-address"
                  required
                  placeholder="House number and street name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-apartment">Apartment, suite, unit (optional)</label>
                <input
                  id="checkout-apartment"
                  placeholder="Apt, Suite, Unit, Flat"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label htmlFor="checkout-city">Town / City *</label>
                  <input
                    id="checkout-city"
                    required
                    placeholder="London"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-postcode">Postcode *</label>
                  <input
                    id="checkout-postcode"
                    required
                    placeholder="e.g. W1K 2PB"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="checkout-phone">Phone Number (for delivery SMS updates)</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </section>

            {/* Step 3: Shipping Method */}
            <section className="checkout-section">
              <h3>3. Delivery Method</h3>
              <div className="shipping-options-list">
                <label className={'shipping-radio-box' + (shippingMethod === 'standard' || shippingMethod === 'free' ? ' selected' : '')}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard' || shippingMethod === 'free'}
                    onChange={() => setShippingMethod(isFreeStandard ? 'free' : 'standard')}
                  />
                  <div className="shipping-radio-info">
                    <strong>Royal Mail Tracked 48 (2–3 Business Days)</strong>
                    <span className="muted">Standard tracked delivery across the UK</span>
                  </div>
                  <strong className="shipping-radio-price">
                    {isFreeStandard ? <span className="free-tag">FREE</span> : '£3.99'}
                  </strong>
                </label>

                <label className={'shipping-radio-box' + (shippingMethod === 'express' ? ' selected' : '')}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                  />
                  <div className="shipping-radio-info">
                    <strong>Royal Mail Tracked 24 (Next Working Day)</strong>
                    <span className="muted">Priority dispatch and expedited delivery</span>
                  </div>
                  <strong className="shipping-radio-price">£5.99</strong>
                </label>

                <label className={'shipping-radio-box' + (shippingMethod === 'saturday' ? ' selected' : '')}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'saturday'}
                    onChange={() => setShippingMethod('saturday')}
                  />
                  <div className="shipping-radio-info">
                    <strong>Guaranteed Saturday Premium Delivery</strong>
                    <span className="muted">Arrives on Saturday morning before 1pm</span>
                  </div>
                  <strong className="shipping-radio-price">£9.99</strong>
                </label>
              </div>
            </section>

            {/* Step 4: Payment */}
            <section className="checkout-section">
              <h3>4. Payment</h3>
              <p className="muted">All transactions are secure and encrypted.</p>

              <div className="payment-accordion">
                {/* Credit Card Option */}
                <div className={'payment-tab' + (paymentMethod === 'card' ? ' active' : '')}>
                  <label className="payment-tab-header">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <strong>Credit / Debit Card</strong>
                    <span className="cards-accepted">Visa • MC • Amex</span>
                  </label>

                  {paymentMethod === 'card' && (
                    <div className="payment-tab-body">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          maxLength="19"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="form-row two-cols">
                        <div className="form-group">
                          <label>Expiration Date</label>
                          <input
                            type="text"
                            maxLength="5"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Security Code (CVV)</label>
                          <input
                            type="password"
                            maxLength="4"
                            placeholder="CVC"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Name on Card</label>
                        <input
                          type="text"
                          placeholder="Full name as shown on card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal Option */}
                <div className={'payment-tab' + (paymentMethod === 'paypal' ? ' active' : '')}>
                  <label className="payment-tab-header">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                    <strong>PayPal</strong>
                    <span className="paypal-tag">Pay with PayPal balance or card</span>
                  </label>
                  {paymentMethod === 'paypal' && (
                    <div className="payment-tab-body">
                      <p className="muted">
                        After clicking “Complete Order”, you will be redirected to PayPal to complete your purchase securely.
                      </p>
                    </div>
                  )}
                </div>

                {/* Klarna Option */}
                <div className={'payment-tab' + (paymentMethod === 'klarna' ? ' active' : '')}>
                  <label className="payment-tab-header">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'klarna'}
                      onChange={() => setPaymentMethod('klarna')}
                    />
                    <strong>Klarna (Pay in 3)</strong>
                    <span className="klarna-tag">3 payments of {money(finalTotal / 3)}</span>
                  </label>
                  {paymentMethod === 'klarna' && (
                    <div className="payment-tab-body">
                      <p className="muted">
                        Split your purchase into 3 interest-free monthly payments. No hidden fees.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className={'payment-tab' + (paymentMethod === 'cod' ? ' active' : '')}>
                  <label className="payment-tab-header">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <strong>Cash on Delivery (UK Mainland)</strong>
                  </label>
                  {paymentMethod === 'cod' && (
                    <div className="payment-tab-body">
                      <p className="muted">
                        Pay upon delivery directly to the courier. Please prepare the exact cash amount ({money(finalTotal)}).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Complete Order CTA */}
            <div className="checkout-submit-row">
              <button
                type="submit"
                disabled={submitting}
                className="btn wide place-order-btn"
              >
                {submitting ? 'Securing & Processing Order…' : `Pay & Complete Order • ${money(finalTotal)}`}
              </button>
            </div>

            <div className="checkout-guarantee">
              <div className="guarantee-item">
                <ShieldIcon /> 100% Authentic perfumes directly from verified perfumers
              </div>
              <div className="guarantee-item">
                <TruckIcon /> Shipped in protective luxury fragrance packaging
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="checkout-sidebar">
          <div className="sidebar-sticky-inner">
            <h3 className="sidebar-title">Order Summary ({items.length})</h3>

            <div className="sidebar-items-list">
              {items.map((i) => (
                <div key={i.id} className="checkout-item-row">
                  <div className="checkout-item-thumb-wrapper">
                    {i.image ? (
                      <img src={i.image} alt={i.title} className="checkout-item-thumb" />
                    ) : (
                      <div className="ph" />
                    )}
                    <span className="checkout-item-badge">{i.qty}</span>
                  </div>
                  <div className="checkout-item-details">
                    <span className="checkout-item-title">{i.title}</span>
                    <span className="checkout-item-size muted">{i.size || '100ml'}</span>
                    <span className="checkout-item-brand muted">{i.brand}</span>
                  </div>
                  <div className="checkout-item-total">
                    {money(i.price * i.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Discount / Coupon form */}
            <form onSubmit={handleApplyPromo} className="checkout-coupon-form">
              <input
                type="text"
                placeholder="Discount code (try PERFUME10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button type="submit" className="btn ghost">
                Apply
              </button>
            </form>
            {promoMsg && (
              <p className={'promo-feedback ' + (promoMsg.ok ? 'success' : 'error')}>
                {promoMsg.message}
              </p>
            )}

            {coupon && (
              <div className="active-coupon-badge">
                <span>Code <strong>{coupon.code}</strong> applied ({coupon.label})</span>
                <button type="button" onClick={removeCoupon}>×</button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="checkout-totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="totals-row discount">
                  <span>Discount ({coupon?.code})</span>
                  <span>−{money(discount)}</span>
                </div>
              )}

              <div className="totals-row">
                <span>Delivery</span>
                <span>
                  {shippingCost === 0 ? <strong className="free-text">FREE</strong> : money(shippingCost)}
                </span>
              </div>

              <div className="totals-row grand-total">
                <div>
                  <strong>Total</strong>
                  <span className="vat-note muted">Including UK VAT</span>
                </div>
                <strong className="grand-total-amount">{money(finalTotal)}</strong>
              </div>
            </div>

            <div className="checkout-help-box">
              <strong>Need Assistance?</strong>
              <p>Email our fragrance advisors at <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a></p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
