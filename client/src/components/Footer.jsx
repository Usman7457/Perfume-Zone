import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FOOTER } from '../data/nav.js';
import { subscribe, getSiteContent } from '../api.js';
import CountrySelect from './CountrySelect.jsx';
import { ShieldIcon, TruckIcon, LockIcon } from './Icons.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [footerData, setFooterData] = useState(() => getSiteContent().footer || {});

  useEffect(() => {
    const onContentChange = (e) => {
      if (e.detail?.footer) {
        setFooterData(e.detail.footer);
      } else {
        setFooterData(getSiteContent().footer || {});
      }
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const r = await subscribe(email).catch(() => ({}));
    setMsg(r.ok ? 'Welcome to Perfume Zone! Your 10% off code is PERFUME10.' : 'Please enter a valid email.');
    if (r.ok) setEmail('');
  };

  const companyLinks = footerData.companyLinks || FOOTER.company.map(([label, to]) => ({ label, to }));
  const legalLinks = footerData.legalLinks || FOOTER.legal.map(([label, to]) => ({ label, to }));
  const socialLinks = footerData.socialLinks || [
    { platform: 'Instagram', url: '#' },
    { platform: 'TikTok', url: '#' },
    { platform: 'Facebook', url: '#' },
    { platform: 'YouTube', url: '#' }
  ];

  return (
    <footer className="footer">
      <section className="newsletter">
        <h3>{footerData.newsletterTitle || 'Join the Perfume Zone Circle'}</h3>
        <p>{footerData.newsletterSubtitle || 'Subscribe to receive private sale updates, new Arabian fragrance arrivals, and 10% off your first order.'}</p>
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
          <h4>{footerData.companyName || 'Perfume Zone'}</h4>
          <p className="muted">
            {footerData.aboutText || "The UK's premier destination for luxurious Arabian perfumes, rare Oud, and artisan Extrait De Parfum."}
          </p>
          <p className="footer-contact">
            <strong>Website:</strong> <a href={footerData.contactWebsite || 'https://perfumezone.uk'}>{footerData.contactWebsite ? footerData.contactWebsite.replace(/^https?:\/\//, '') : 'perfumezone.uk'}</a><br />
            <strong>Email:</strong> <a href={`mailto:${footerData.contactEmail || 'support@perfumezone.uk'}`}>{footerData.contactEmail || 'support@perfumezone.uk'}</a>
            {footerData.contactPhone && (
              <>
                <br />
                <strong>Phone:</strong> <a href={`tel:${footerData.contactPhone.replace(/\s+/g, '')}`}>{footerData.contactPhone}</a>
              </>
            )}
          </p>
          <ul className="social">
            {socialLinks.map((s) => (
              <li key={s.platform || s.url}>
                <a
                  href={s.url || '#'}
                  target={s.url && s.url !== '#' ? '_blank' : undefined}
                  rel={s.url && s.url !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={s.platform}
                  onClick={(e) => { if (!s.url || s.url === '#') e.preventDefault(); }}
                >
                  {s.platform}
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
            {companyLinks.map((item) => (
              <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Legal & Policies</h4>
          <ul>
            {legalLinks.map((item) => (
              <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
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
            <span>Google Pay</span>
            <span>PayPal</span>
            <span>Klarna</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <CountrySelect dropUp />
        <span>{footerData.copyrightText || `© ${new Date().getFullYear()} Perfume Zone (perfumezone.uk). All rights reserved.`}</span>
      </div>
    </footer>
  );
}
