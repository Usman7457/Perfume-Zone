import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FOOTER } from '../data/nav.js';
import { subscribe } from '../api.js';
import CountrySelect from './CountrySelect.jsx';
import { ShieldIcon, TruckIcon, LockIcon } from './Icons.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const r = await subscribe(email).catch(() => ({}));
    setMsg(r.ok ? 'Welcome to Perfume Zone! Your 10% off code is PERFUME10.' : 'Please enter a valid email.');
    if (r.ok) setEmail('');
  };

  return (
    <footer className="footer">
      <section className="newsletter">
        <h3>Join the Perfume Zone Circle</h3>
        <p>Subscribe to receive private sale updates, new Arabian fragrance arrivals, and 10% off your first order.</p>
        <form onSubmit={submit}>
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn">Subscribe</button>
        </form>
        {msg && <p className="status-msg" role="status">{msg}</p>}
      </section>

      <div className="footer-badges">
        <div className="badge-item">
          <TruckIcon />
          <div>
            <strong>Free UK Delivery</strong>
            <span>On all orders over £50</span>
          </div>
        </div>
        <div className="badge-item">
          <ShieldIcon />
          <div>
            <strong>100% Authentic Guarantee</strong>
            <span>Direct from Dubai & European houses</span>
          </div>
        </div>
        <div className="badge-item">
          <LockIcon />
          <div>
            <strong>Secure Encrypted Checkout</strong>
            <span>SSL Protection & Fast Dispatch</span>
          </div>
        </div>
      </div>

      <div className="footer-grid">
        <div>
          <h4>Perfume Zone</h4>
          <p className="muted">
            The UK's premier destination for luxurious Arabian perfumes, rare Oud, and artisan Extrait De Parfum.
          </p>
          <p className="footer-contact">
            <strong>Website:</strong> <a href="https://perfumezone.uk">perfumezone.uk</a><br />
            <strong>Email:</strong> <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a>
          </p>
          <ul className="social">
            {['Instagram', 'TikTok', 'Facebook', 'YouTube'].map((s) => (
              <li key={s}>
                <a href="#" aria-label={s} onClick={(e) => e.preventDefault()}>
                  {s}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="https://uk.trustpilot.com/review/perfumezone.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="trust"
          >
            ★ Rated Excellent on Trustpilot
          </a>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            {FOOTER.company.map(([l, t]) => (
              <li key={t}><Link to={t}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Legal & Policies</h4>
          <ul>
            {FOOTER.legal.map(([l, t]) => (
              <li key={t}><Link to={t}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Our Mission</h4>
          <p>
            Dedicated to bringing captivating scents, artisanal craftsmanship, and exceptional customer service to fragrance lovers across the United Kingdom and Europe.
          </p>
          <div className="secure-payment-icons">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Apple Pay</span>
            <span>PayPal</span>
            <span>Klarna</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <CountrySelect dropUp />
        <span>© {new Date().getFullYear()} Perfume Zone (<a href="https://perfumezone.uk" className="domain-link">perfumezone.uk</a>). All rights reserved.</span>
      </div>
    </footer>
  );
}
