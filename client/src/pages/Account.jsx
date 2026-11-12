import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { useWishlist } from '../components/WishlistContext.jsx';
import { getUserOrders, getOrderById, money } from '../api.js';
import { UserIcon, TruckIcon, HeartIcon, ShieldIcon, CheckIcon, BagIcon } from '../components/Icons.jsx';

const ORDER_STAGES = [
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Your order is verified & confirmed' },
  { key: 'Quality Check', label: 'Packing & QC', desc: 'Authentic batch inspection & wrapping' },
  { key: 'Dispatched', label: 'Dispatched', desc: 'Handed over to UK courier' },
  { key: 'Delivered', label: 'Delivered', desc: 'Signed & delivered to your address' }
];

function getStageIndex(status) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('cancel')) return -1;
  if (s.includes('deliver') && !s.includes('out')) return 3;
  if (s.includes('dispatch') || s.includes('ship') || s.includes('transit') || s.includes('out')) return 2;
  if (s.includes('quality') || s.includes('pack') || s.includes('process')) return 1;
  return 0;
}

function StatusBadge({ status }) {
  const s = (status || 'Confirmed').toLowerCase();
  let cls = 'status-badge confirmed';
  if (s.includes('deliver') && !s.includes('out')) cls = 'status-badge delivered';
  else if (s.includes('dispatch') || s.includes('ship') || s.includes('out')) cls = 'status-badge dispatched';
  else if (s.includes('quality') || s.includes('pack')) cls = 'status-badge processing';
  else if (s.includes('cancel')) cls = 'status-badge cancelled';
  return <span className={cls}>{status || 'Confirmed'}</span>;
}

export default function Account({ forcedTab }) {
  const { tab: paramTab } = useParams();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const { user, isAdmin, login, register, updateProfile, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const activeTab = forcedTab || paramTab || 'overview';
  const redirectTarget = searchParams.get('redirect') || '';

  // Auth form state
  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Customer data state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Track order state
  const [trackInput, setTrackInput] = useState(searchParams.get('orderId') || '');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postcode: '',
    country: 'United Kingdom'
  });
  const [profileMsg, setProfileMsg] = useState('');

  const loadOrders = async (email) => {
    if (!email) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const list = await getUserOrders(email);
      setOrders(Array.isArray(list) ? list : []);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders(user.email);
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        apartment: user.apartment || '',
        city: user.city || '',
        postcode: user.postcode || '',
        country: user.country || 'United Kingdom'
      });
    } else {
      setOrders([]);
    }

    const onOrdersChange = () => {
      if (user) loadOrders(user.email);
    };
    window.addEventListener('pz:orders-change', onOrdersChange);
    return () => window.removeEventListener('pz:orders-change', onOrdersChange);
  }, [user]);

  useEffect(() => {
    const qId = searchParams.get('orderId');
    if (qId) {
      setTrackInput(qId);
      handleTrackLookup(qId);
    } else if (activeTab === 'track-order' && orders.length > 0 && !trackedOrder) {
      setTrackInput(orders[0].id);
      setTrackedOrder(orders[0]);
    }
  }, [activeTab, searchParams, orders.length]);

  const handleTrackLookup = async (idToFind) => {
    const cleanId = (idToFind || trackInput || '').trim();
    if (!cleanId) {
      setTrackError('Please enter an Order Reference (e.g. PZ-100001).');
      setTrackedOrder(null);
      return;
    }
    setTrackingLoading(true);
    setTrackError('');
    try {
      const found = await getOrderById(cleanId);
      if (!found) {
        setTrackedOrder(null);
        setTrackError(`No order found with reference "${cleanId}". Please double-check your confirmation email.`);
      } else {
        setTrackedOrder(found);
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const res = login(loginEmail, loginPassword);
    if (!res.ok) {
      setAuthError(res.error);
      return;
    }
    setLoginPassword('');
    if (res.user.role === 'admin') {
      nav(redirectTarget || '/admin');
    } else {
      nav(redirectTarget || '/account');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regEmail.trim() || regPassword.length < 6) {
      setAuthError('Please enter your name, a valid email, and a password of at least 6 characters.');
      return;
    }
    const res = register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    if (!res.ok) {
      setAuthError(res.error);
      return;
    }
    setRegPassword('');
    nav(redirectTarget || '/account');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg('');
    const res = updateProfile(profileForm);
    if (res.ok) {
      setProfileMsg('Profile and delivery details updated successfully.');
      setTimeout(() => setProfileMsg(''), 3500);
    }
  };

  const renderTrackOrderPanel = () => {
    const stageIdx = trackedOrder ? getStageIndex(trackedOrder.status) : 0;
    return (
      <div className="dash-card">
        <div className="dash-card-head">
          <div>
            <span className="eyebrow">Live Dispatch Updates</span>
            <h2>Track Your Order</h2>
            <p className="muted small" style={{ margin: 0 }}>
              Enter your Perfume Zone order reference to check live dispatch &amp; courier progress.
            </p>
          </div>
        </div>

        <form
          className="track-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleTrackLookup(trackInput);
          }}
        >
          <input
            type="text"
            placeholder="Enter Order ID (e.g. PZ-100001)"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
          />
          <button type="submit" className="btn" disabled={trackingLoading}>
            {trackingLoading ? 'Searching…' : 'Track Order'}
          </button>
        </form>

        {orders.length > 0 && (
          <div className="track-quick-chips">
            <span className="muted small">Your recent orders:</span>
            {orders.slice(0, 5).map((o) => (
              <button
                key={o.id}
                type="button"
                className={'chip-btn' + (trackedOrder?.id === o.id ? ' active' : '')}
                onClick={() => {
                  setTrackInput(o.id);
                  setTrackedOrder(o);
                  setTrackError('');
                }}
              >
                {o.id} • {o.status || 'Confirmed'}
              </button>
            ))}
          </div>
        )}

        {trackError && <div className="checkout-error-banner" style={{ marginTop: 16 }}>{trackError}</div>}

        {trackedOrder && (
          <div className="track-result-box">
            <div className="track-result-top">
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}>Order Reference</span>
                <h3>{trackedOrder.id}</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Placed on {new Date(trackedOrder.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })} • {money(trackedOrder.total)}
                </p>
              </div>
              <StatusBadge status={trackedOrder.status} />
            </div>

            {stageIdx === -1 ? (
              <div className="checkout-error-banner" style={{ marginTop: 16 }}>
                This order has been marked as <strong>Cancelled</strong>. Please contact support@perfumezone.uk for assistance.
              </div>
            ) : (
              <div className="track-stepper">
                {ORDER_STAGES.map((stage, idx) => {
                  const done = idx <= stageIdx;
                  const active = idx === stageIdx;
                  return (
                    <div key={stage.key} className={'track-step' + (done ? ' done' : '') + (active ? ' current' : '')}>
                      <div className="track-step-dot">{done ? <CheckIcon /> : idx + 1}</div>
                      <div className="track-step-text">
                        <strong>{stage.label}</strong>
                        <span>{stage.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="track-meta-grid">
              <div className="track-meta-box">
                <span className="muted small">Courier &amp; Service</span>
                <strong>{trackedOrder.courier || 'Royal Mail Tracked 24'}</strong>
              </div>
              <div className="track-meta-box">
                <span className="muted small">Tracking Number</span>
                <strong>{trackedOrder.trackingNumber || 'Awaiting courier scan'}</strong>
              </div>
              <div className="track-meta-box">
                <span className="muted small">Delivery Destination</span>
                <strong>
                  {trackedOrder.shippingAddress?.city || 'UK'}{trackedOrder.shippingAddress?.postcode ? `, ${trackedOrder.shippingAddress.postcode}` : ''}
                </strong>
              </div>
            </div>

            {trackedOrder.adminNote && (
              <div className="track-admin-note">
                <strong>Dispatch Update:</strong> {trackedOrder.adminNote}
              </div>
            )}

            <div className="track-items-summary">
              <div className="track-items-head">
                <strong>Items in Parcel ({trackedOrder.items?.length || 0})</strong>
                <Link to={`/order-confirmation/${trackedOrder.id}`} className="login-hint">
                  View Full Receipt →
                </Link>
              </div>
              {(trackedOrder.items || []).map((item, i) => (
                <div key={i} className="track-item-line">
                  <span>{item.qty} × {item.title} ({item.size || '100ml'})</span>
                  <span>{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Unauthenticated view
  if (!user) {
    if (activeTab === 'track-order') {
      return (
        <div className="dashboard-shell">
          <div className="container account-page-container" style={{ maxWidth: 920 }}>
            <div style={{ marginBottom: 18 }}>
              <Link to="/account" className="login-hint">← Sign In or Create an Account</Link>
            </div>
            {renderTrackOrderPanel()}
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-shell">
        <div className="container account-page-container">
          <div className="account-auth-box">
            <div className="account-auth-header">
              <span className="eyebrow">Perfume Zone Member Portal</span>
              <h1>{authTab === 'login' ? 'Sign In' : 'Create Customer Account'}</h1>
              <p className="muted">
                {redirectTarget
                  ? 'Sign in or create an account to continue securely.'
                  : 'Sign in to access your dashboard, order history, and parcel tracking.'}
              </p>
            </div>

            <div className="account-tabs">
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

            {authError && <div className="checkout-error-banner" style={{ marginBottom: 16 }}>{authError}</div>}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="account-form">
                <div className="form-group">
                  <label htmlFor="acc-login-email">Email Address *</label>
                  <input
                    id="acc-login-email"
                    type="email"
                    required
                    placeholder="name@example.co.uk"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="acc-login-password">Password *</label>
                  <input
                    id="acc-login-password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn wide">
                  Sign In to Dashboard
                </button>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link to="/track-order" className="login-hint">
                    Track an Order by Reference Number →
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="account-form">
                <div className="form-group">
                  <label htmlFor="acc-reg-name">Full Name *</label>
                  <input
                    id="acc-reg-name"
                    type="text"
                    required
                    placeholder="e.g. Emily Carter"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="acc-reg-email">Email Address *</label>
                    <input
                      id="acc-reg-email"
                      type="email"
                      required
                      placeholder="emily@example.co.uk"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="acc-reg-phone">Phone Number</label>
                    <input
                      id="acc-reg-phone"
                      type="tel"
                      placeholder="+44 7700 900000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="acc-reg-password">Password * (min 6 characters)</label>
                  <input
                    id="acc-reg-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn wide">
                  Create Customer Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="dashboard-shell">
      <div className="container account-page-container">
        {isAdmin && (
          <div className="admin-role-banner">
            <div>
              <strong>Administrator Session Active</strong>
              <span className="muted"> — Manage products, orders, blog posts, offers &amp; users from the Admin Dashboard.</span>
            </div>
            <Link to="/admin" className="btn">
              Open Admin Dashboard →
            </Link>
          </div>
        )}

        <div className="dashboard-layout">
          {/* Sidebar Navigation */}
          <aside className="dash-sidebar">
            <div className="dash-user-card">
              <div className="dash-avatar">
                {(user.name || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="dash-user-meta">
                <strong>{user.name}</strong>
                <span className="muted small dash-email-truncate">{user.email}</span>
                <span className={'role-pill ' + (isAdmin ? 'admin' : '')}>
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>

            <div className="dash-nav-group">
              <span className="dash-nav-heading">My Account</span>
              <nav className="dash-nav">
                <NavLink
                  to="/account"
                  end
                  className={({ isActive }) =>
                    'dash-nav-link' + (isActive && activeTab === 'overview' ? ' active' : '')
                  }
                >
                  <UserIcon /> <span>Dashboard Overview</span>
                </NavLink>
                <NavLink to="/account/orders" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                  <BagIcon />
                  <span>Order History</span>
                  <span className="dash-count-pill">{orders.length}</span>
                </NavLink>
                <NavLink
                  to="/account/track-order"
                  className={({ isActive }) =>
                    'dash-nav-link' + (isActive || activeTab === 'track-order' ? ' active' : '')
                  }
                >
                  <TruckIcon /> <span>Track Order</span>
                </NavLink>
                <NavLink to="/account/profile" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                  <ShieldIcon /> <span>Profile &amp; Address</span>
                </NavLink>
                <Link to="/wishlist" className="dash-nav-link">
                  <HeartIcon />
                  <span>Saved Wishlist</span>
                  <span className="dash-count-pill">{wishlistCount}</span>
                </Link>
              </nav>
            </div>

            <div className="dash-sidebar-footer">
              {isAdmin && (
                <Link to="/admin" className="dash-nav-link admin-shortcut">
                  <ShieldIcon /> <span>Admin Dashboard →</span>
                </Link>
              )}
              <button
                type="button"
                className="btn ghost wide"
                style={{ marginTop: 10 }}
                onClick={() => {
                  logout();
                  nav('/account');
                }}
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="dash-main">
            {activeTab === 'overview' && (
              <div className="dash-stack">
                <div className="dash-header-bar">
                  <div>
                    <span className="eyebrow">Customer Portal</span>
                    <h1>Welcome back, {user.name}</h1>
                    <p className="muted" style={{ margin: 0 }}>
                      View recent purchases, track parcels in real time, and manage your UK delivery address.
                    </p>
                  </div>
                  <div className="dash-header-actions">
                    <Link to="/collections/all" className="btn ghost">Browse Perfumes</Link>
                    <Link to="/account/track-order" className="btn">Track a Parcel</Link>
                  </div>
                </div>

                <div className="stat-cards-grid cols-4">
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Total Orders</span>
                      <span className="stat-icon-badge"><BagIcon /></span>
                    </div>
                    <strong className="stat-value">{orders.length}</strong>
                    <span className="stat-sub">Completed &amp; active</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Total Spent</span>
                      <span className="stat-icon-badge"><TruckIcon /></span>
                    </div>
                    <strong className="stat-value">{money(totalSpent)}</strong>
                    <span className="stat-sub">Lifetime purchases</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Saved Wishlist</span>
                      <span className="stat-icon-badge"><HeartIcon /></span>
                    </div>
                    <strong className="stat-value">{wishlistCount}</strong>
                    <span className="stat-sub">Favourite scents</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Membership</span>
                      <span className="stat-icon-badge"><ShieldIcon /></span>
                    </div>
                    <strong className="stat-value" style={{ fontSize: '1.25rem' }}>Verified VIP</strong>
                    <span className="stat-sub">Since {user.joinedDate || '2026'}</span>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <h3>Recent Orders</h3>
                      <p className="muted small" style={{ margin: 0 }}>Your latest Fragrance orders &amp; courier links.</p>
                    </div>
                    <Link to="/account/orders" className="login-hint">View All Orders →</Link>
                  </div>

                  {loadingOrders ? (
                    <p className="muted">Loading your orders…</p>
                  ) : orders.length === 0 ? (
                    <div className="empty-orders-box">
                      <p className="muted">You haven&apos;t placed an order yet.</p>
                      <Link to="/collections/all" className="btn">Explore Perfumes</Link>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders.slice(0, 3).map((ord) => (
                        <div key={ord.id} className="order-history-card">
                          <div className="order-card-head">
                            <div>
                              <strong>Order {ord.id}</strong>
                              <span className="order-date muted">
                                {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <StatusBadge status={ord.status} />
                          </div>
                          <div className="order-card-body">
                            <p className="muted small" style={{ margin: 0 }}>
                              {ord.items?.length || 1} item(s) • Total: <strong>{money(ord.total)}</strong>
                              {ord.trackingNumber ? ` • Tracking: ${ord.trackingNumber}` : ''}
                            </p>
                            <div className="order-card-links">
                              <Link to={`/account/track-order?orderId=${encodeURIComponent(ord.id)}`} className="login-hint">
                                Track Parcel →
                              </Link>
                              <Link to={`/order-confirmation/${ord.id}`} className="login-hint">
                                Receipt →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <span className="eyebrow">Purchase Records</span>
                    <h2>Order History ({orders.length})</h2>
                    <p className="muted small" style={{ margin: 0 }}>
                      Complete record of all orders placed with {user.email}.
                    </p>
                  </div>
                  <Link to="/collections/all" className="btn ghost">Continue Shopping</Link>
                </div>

                {loadingOrders ? (
                  <p className="muted">Loading your order history…</p>
                ) : orders.length === 0 ? (
                  <div className="empty-orders-box">
                    <p className="muted">No orders placed under this account yet.</p>
                    <Link to="/collections/all" className="btn">Shop Fragrances</Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((ord) => (
                      <div key={ord.id} className="order-history-card">
                        <div className="order-card-head">
                          <div>
                            <strong>{ord.id}</strong>
                            <span className="order-date muted">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <StatusBadge status={ord.status} />
                        </div>
                        <div className="order-items-mini">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="track-item-line">
                              <span>{item.qty} × {item.title} ({item.size || '100ml'})</span>
                              <span>{money(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-card-body order-card-footer-line">
                          <div>
                            <strong>Total: {money(ord.total)}</strong>
                            {ord.courier && <span className="muted small"> • {ord.courier}</span>}
                          </div>
                          <div className="order-card-links">
                            <Link to={`/account/track-order?orderId=${encodeURIComponent(ord.id)}`} className="login-hint">
                              Track Order →
                            </Link>
                            <Link to={`/order-confirmation/${ord.id}`} className="login-hint">
                              View Receipt →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'track-order' && renderTrackOrderPanel()}

            {activeTab === 'profile' && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <span className="eyebrow">Shipping Preferences</span>
                    <h2>Profile &amp; Delivery Address</h2>
                    <p className="muted small" style={{ margin: 0 }}>
                      Keep your UK shipping address ready for one-click checkout.
                    </p>
                  </div>
                </div>

                {profileMsg && <div className="checkout-success-banner">{profileMsg}</div>}

                <form onSubmit={handleSaveProfile} className="dash-form-stack">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="prof-name">Full Name</label>
                      <input
                        id="prof-name"
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prof-email">Account Email</label>
                      <input id="prof-email" type="email" value={user.email} disabled />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="prof-phone">Phone Number</label>
                      <input
                        id="prof-phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prof-country">Country</label>
                      <input
                        id="prof-country"
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prof-address">Street Address</label>
                    <input
                      id="prof-address"
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="prof-apt">Flat / Suite</label>
                      <input
                        id="prof-apt"
                        type="text"
                        value={profileForm.apartment}
                        onChange={(e) => setProfileForm({ ...profileForm, apartment: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prof-city">City / Town</label>
                      <input
                        id="prof-city"
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prof-postcode">Postcode</label>
                      <input
                        id="prof-postcode"
                        type="text"
                        value={profileForm.postcode}
                        onChange={(e) => setProfileForm({ ...profileForm, postcode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-panel-footer" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn">Save Profile Changes</button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
