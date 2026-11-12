import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { money, getUserOrders } from '../api.js';
import { UserIcon, BagIcon, TruckIcon } from '../components/Icons.jsx';

export default function Account() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('perfumezone_user')) || null;
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user?.email) {
      getUserOrders(user.email).then(setOrders).catch(() => {});
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem('perfumezone_orders')) || [];
        setOrders(stored);
      } catch {
        setOrders([]);
      }
    }
  }, [user]);

  const handleAuth = (e) => {
    e.preventDefault();
    const newUser = {
      name: name || (email.split('@')[0] ? email.split('@')[0].toUpperCase() : 'Valued Customer'),
      email: email || 'customer@perfumezone.uk',
      joinedDate: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    };
    localStorage.setItem('perfumezone_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('perfumezone_user');
    setUser(null);
  };

  if (user) {
    return (
      <div className="container account-dashboard">
        <header className="account-header">
          <div className="account-avatar-circle">
            <UserIcon />
          </div>
          <div>
            <h1>Welcome back, {user.name}</h1>
            <p className="muted">{user.email} • Member of Perfume Zone UK</p>
          </div>
          <button className="btn ghost logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </header>

        <div className="account-grid">
          {/* Orders Section */}
          <section className="account-orders-section">
            <div className="section-head-row">
              <h2>Order History</h2>
              <span className="muted">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</span>
            </div>

            {orders.length === 0 ? (
              <div className="no-orders-box center">
                <BagIcon />
                <h3>No Orders Yet</h3>
                <p className="muted">You have not placed any orders yet. Discover our collection of luxury Arabian scents.</p>
                <Link to="/collections/all" className="btn">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-cards-list">
                {orders.map((ord) => (
                  <div key={ord.id} className="order-history-card">
                    <div className="order-card-head">
                      <div>
                        <strong>Order #{ord.id}</strong>
                        <span className="muted order-date">
                          Placed on {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="order-status-pill">
                        <TruckIcon /> {ord.status || 'Confirmed'}
                      </div>
                    </div>

                    <div className="order-card-items">
                      {(ord.items || []).map((it, idx) => (
                        <div key={idx} className="order-card-line">
                          <div className="order-item-thumb">
                            {it.image ? <img src={it.image} alt={it.title} /> : <div className="ph" />}
                          </div>
                          <div className="order-item-desc">
                            <span className="order-item-title">{it.title}</span>
                            <span className="muted">{it.size || '100ml'} • Qty: {it.qty}</span>
                          </div>
                          <div className="order-item-line-total">
                            {money(it.price * it.qty)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <span className="order-footer-total">
                        Total: <strong>{money(ord.total)}</strong>
                      </span>
                      <Link to={'/order-confirmation/' + ord.id} className="link view-receipt-link">
                        View Full Receipt →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Account Details & Quick Links */}
          <aside className="account-details-sidebar">
            <div className="sidebar-card">
              <h3>VIP Member Benefits</h3>
              <ul className="vip-benefits-list">
                <li>✓ Free UK Tracked delivery on orders over £50</li>
                <li>✓ 10% Off with code <code>PERFUME10</code></li>
                <li>✓ Priority access to limited batch Arabian oud drops</li>
                <li>✓ Dedicated customer concierge at perfumezone.uk</li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3>Need Assistance?</h3>
              <p className="muted">Our London fragrance advisors are here to help with any order questions.</p>
              <Link to="/pages/contact-us" className="btn ghost wide">
                Contact Concierge
              </Link>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="container narrow auth-page">
      <header className="page-header center">
        <span className="eyebrow">PERFUME ZONE UK</span>
        <h1>{mode === 'login' ? 'Sign In to Your Account' : 'Create a Perfume Zone Account'}</h1>
        <p className="muted">
          Access your order history, save wishlist fragrances, and unlock member promotions at <strong>perfumezone.uk</strong>.
        </p>
      </header>

      <div className="auth-card">
        <form className="form auth-form" onSubmit={handleAuth}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                required
                placeholder="e.g. Alexander Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. alexander@example.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn wide auth-submit-btn">
            {mode === 'login' ? 'Sign In' : 'Create My Account'}
          </button>
        </form>

        <div className="auth-toggle-row center">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                className="link font-bold"
                onClick={() => setMode('register')}
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                className="link font-bold"
                onClick={() => setMode('login')}
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
