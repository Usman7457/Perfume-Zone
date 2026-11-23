import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext.jsx';
import { useAuth } from '../components/AuthContext.jsx';
import { money, createOrder } from '../api.js';
import { useCurrency } from '../components/CurrencyContext.jsx';
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
  const { user, login, register, updateProfile, logout } = useAuth();
  const { currency } = useCurrency();
  const nav = useNavigate();

  // Checkout Auth Gate state
  const [authTab, setAuthTab] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');

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

  useEffect(() => {
    if (!user) return;
    const parts = (user.name || '').trim().split(/\s+/);
    const fName = parts[0] || '';
    const lName = parts.slice(1).join(' ') || '';
    setEmail((prev) => prev || user.email || '');
    setFirstName((prev) => prev || fName);
    setLastName((prev) => prev || lName);
    setAddress((prev) => prev || user.address || '');
    setApartment((prev) => prev || user.apartment || '');
    setCity((prev) => prev || user.city || '');
    setPostcode((prev) => prev || user.postcode || '');
    setCountry((prev) => prev || user.country || 'United Kingdom');
    setPhone((prev) => prev || user.phone || '');
  }, [user]);

  const handleGateLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const res = login(authEmail, authPassword);
    if (!res.ok) {
      setAuthError(res.error);
      return;
    }
    setAuthPassword('');
  };

  const handleGateRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authName.trim() || !authEmail.trim() || authPassword.length < 6) {
      setAuthError('Please enter your full name, email address, and a password of at least 6 characters.');
      return;
    }
    const res = register({
      name: authName,
      email: authEmail,
      password: authPassword,
      phone: authPhone
    });
    if (!res.ok) {
      setAuthError(res.error);
      return;
    }
    setAuthPassword('');
  };

  // Shipping Method
  const isFreeStandard = subtotal >= freeShippingThreshold || coupon?.type === 'free_shipping';
  const [shippingMethod, setShippingMethod] = useState(isFreeStandard ? 'free' : 'standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  const handleCardCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(raw);
  };

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

    if (!user) {
      setFormError('Please sign in or create an account before placing an order.');
      return;
    }

    setSubmitting(true);

    try {
      const paymentPlatformMap = {
        card: 'Stripe (Credit / Debit Card)',
        googlepay: 'Google Pay (UK)',
        paypal: 'PayPal Express',
        klarna: 'Klarna (Pay in 3)',
        cod: 'Cash on Delivery (UK Mainland)'
      };

      const orderPayload = {
        email: email || user.email,
        customerName: `${firstName} ${lastName}`.trim() || user.name,
        userId: user.id,
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
        paymentPlatform: paymentPlatformMap[paymentMethod] || 'Stripe / Card Payment',
        currency: currency?.code || 'GBP',
        newsletter
      };

      const newOrder = await createOrder(orderPayload);
      updateProfile({
        phone,
        address,
        apartment,
        city,
        postcode,
        country
      });
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
        {/* Left Column: Auth Gate or Checkout Form Details */}
        <div className="checkout-main">
          {!user ? (
            <div className="checkout-auth-gate">
              <div className="checkout-auth-head">
                <span className="eyebrow">Account Required to Checkout</span>
                <h2>Sign In or Create an Account</h2>
                <p className="muted">
                  Please sign in to your Perfume Zone account—or create a free customer account in seconds—to place your order and track delivery.
                </p>
              </div>

              <div className="account-tabs" style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  className={authTab === 'login' ? 'active' : ''}
                  onClick={() => { setAuthTab('login'); setAuthError(''); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={authTab === 'register' ? 'active' : ''}
                  onClick={() => { setAuthTab('register'); setAuthError(''); }}
                >
                  Create Account
                </button>
              </div>

              {authError && <div className="checkout-error-banner">{authError}</div>}

              {authTab === 'login' ? (
                <form onSubmit={handleGateLogin} className="checkout-form" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label htmlFor="gate-email">Email Address *</label>
                    <input
                      id="gate-email"
                      type="email"
                      required
                      placeholder="e.g. name@example.co.uk"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gate-password">Password *</label>
                    <input
                      id="gate-password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn wide">
                    Sign In &amp; Continue to Shipping
                  </button>
                  <p className="muted small" style={{ textAlign: 'center', margin: 0 }}>
                    New to Perfume Zone?{' '}
                    <button
                      type="button"
                      className="link-inline-btn"
                      onClick={() => { setAuthTab('register'); setAuthError(''); }}
                    >
                      Create an account first
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleGateRegister} className="checkout-form" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label htmlFor="gate-reg-name">Full Name *</label>
                    <input
                      id="gate-reg-name"
                      type="text"
                      required
                      placeholder="e.g. Sophie Bennett"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="gate-reg-email">Email Address *</label>
                      <input
                        id="gate-reg-email"
                        type="email"
                        required
                        placeholder="sophie@example.co.uk"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="gate-reg-phone">Phone Number</label>
                      <input
                        id="gate-reg-phone"
                        type="tel"
                        placeholder="+44 7700 900000"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="gate-reg-password">Create Password * (min 6 characters)</label>
                    <input
                      id="gate-reg-password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Create a secure password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn wide">
                    Create Account &amp; Continue to Checkout
                  </button>
                </form>
              )}

              <div className="checkout-guarantee" style={{ marginTop: 24 }}>
                <div className="guarantee-item">
                  <ShieldIcon /> Order history &amp; live parcel tracking saved to your account
                </div>
                <div className="guarantee-item">
                  <TruckIcon /> Express UK Royal Mail &amp; DPD courier checkout
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="checkout-signed-in-bar">
                <div>
                  <strong>Signed in as {user.name}</strong>
                  <span className="muted"> ({user.email})</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Link to={user.role === 'admin' ? '/admin' : '/account/orders'} className="login-hint">
                    {user.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
                  </Link>
                  <button type="button" className="link-inline-btn" onClick={logout}>
                    Switch Account
                  </button>
                </div>
              </div>

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
                    <span className="muted small">Account Verified ✓</span>
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
                    {isFreeStandard ? <span className="free-tag">FREE</span> : money(3.99)}
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
                  <strong className="shipping-radio-price">{money(5.99)}</strong>
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
                  <strong className="shipping-radio-price">{money(9.99)}</strong>
                </label>
              </div>
            </section>

            {/* Step 4: Payment */}
            <section id="checkout-payment-section" className="checkout-section">
              <h3>4. Payment</h3>
              <p className="muted">All transactions are secure and encrypted. Select your preferred UK payment method:</p>

              {/* Express Wallets Bar */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <LockIcon style={{ width: 14, height: 14 }} /> Express Checkout
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('googlepay')}
                    style={{
                      background: '#000000',
                      color: '#ffffff',
                      border: '1px solid #000000',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      outline: paymentMethod === 'googlepay' ? '2px solid #2563eb' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>G</span>Pay
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    style={{
                      background: '#ffc439',
                      color: '#003087',
                      border: '1px solid #ffc439',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      outline: paymentMethod === 'paypal' ? '2px solid #2563eb' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span style={{ fontStyle: 'italic', fontWeight: 800 }}>PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('klarna')}
                    style={{
                      background: '#ffb3c7',
                      color: '#0a0a0a',
                      border: '1px solid #ffb3c7',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      outline: paymentMethod === 'klarna' ? '2px solid #2563eb' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    Klarna.
                  </button>
                </div>
              </div>

              <div className="payment-accordion">
                {/* Google Pay Option */}
                <div className={'payment-tab' + (paymentMethod === 'googlepay' ? ' active' : '')}>
                  <label className="payment-tab-header">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'googlepay'}
                      onChange={() => setPaymentMethod('googlepay')}
                    />
                    <strong>Google Pay (UK)</strong>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#000000',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.3px',
                      marginLeft: 'auto'
                    }}>
                      GPay
                    </span>
                  </label>

                  {paymentMethod === 'googlepay' && (
                    <div className="payment-tab-body">
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '14px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Connected Google Wallet</span>
                          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>✓ Verified &amp; Ready</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 38,
                            height: 24,
                            background: '#1e293b',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.5px'
                          }}>
                            VISA
                          </div>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Google Pay • Visa •••• 4242</span>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Fast 1-touch checkout • Encrypted token</div>
                          </div>
                        </div>
                      </div>
                      <p className="muted" style={{ fontSize: '13px', margin: 0 }}>
                        Click &ldquo;Pay &amp; Complete Order&rdquo; below to confirm with your Google Pay biometric / device authentication.
                      </p>
                    </div>
                  )}
                </div>

                {/* Credit Card Option */}
                <div className={'payment-tab' + (paymentMethod === 'card' ? ' active' : '')}>
                  <label className="payment-tab-header">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <strong>Credit / Debit Card (Stripe Gateway)</strong>
                    <span className="cards-accepted">Visa • MC • Amex • Maestro</span>
                  </label>

                  {paymentMethod === 'card' && (
                    <div className="payment-tab-body">
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          maxLength="19"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                        />
                      </div>
                      <div className="form-row two-cols">
                        <div className="form-group">
                          <label>Expiration Date *</label>
                          <input
                            type="text"
                            maxLength="5"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Security Code (CVV) *</label>
                          <input
                            type="password"
                            maxLength="4"
                            placeholder="CVC"
                            value={cardCvc}
                            onChange={handleCardCvcChange}
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
                      <p className="muted" style={{ fontSize: '12px', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LockIcon style={{ width: 12, height: 12 }} /> 256-bit TLS encrypted transaction processed securely via Stripe.
                      </p>
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
                    <strong>PayPal Express</strong>
                    <span className="paypal-tag" style={{ marginLeft: 'auto' }}>Pay with PayPal or Card</span>
                  </label>
                  {paymentMethod === 'paypal' && (
                    <div className="payment-tab-body">
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '14px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 600 }}>PayPal Account Balance &amp; Linked Cards</span>
                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>PayPal UK Ready</span>
                      </div>
                      <p className="muted" style={{ fontSize: '13px', margin: 0 }}>
                        Pay safely using your PayPal balance, bank account, or credit/debit card with full PayPal Buyer Protection.
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
                    <span className="klarna-tag" style={{ marginLeft: 'auto' }}>3 payments of {money(finalTotal / 3)}</span>
                  </label>
                  {paymentMethod === 'klarna' && (
                    <div className="payment-tab-body">
                      <div style={{
                        background: '#fdf2f8',
                        border: '1px solid #fbcfe8',
                        borderRadius: '6px',
                        padding: '14px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#831843', marginBottom: '8px' }}>
                          Klarna Pay in 3 Installment Plan:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                          <div style={{ background: '#ffffff', padding: '8px', borderRadius: '4px', border: '1px solid #fce7f3' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Today</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{money(finalTotal / 3)}</div>
                          </div>
                          <div style={{ background: '#ffffff', padding: '8px', borderRadius: '4px', border: '1px solid #fce7f3' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>In 30 Days</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{money(finalTotal / 3)}</div>
                          </div>
                          <div style={{ background: '#ffffff', padding: '8px', borderRadius: '4px', border: '1px solid #fce7f3' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>In 60 Days</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{money(finalTotal / 3)}</div>
                          </div>
                        </div>
                      </div>
                      <p className="muted" style={{ fontSize: '13px', margin: 0 }}>
                        Split your purchase into 3 interest-free monthly payments. No interest, no extra fees when paid on time.
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
                      <p className="muted" style={{ margin: 0 }}>
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
            </>
          )}
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
