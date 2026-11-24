import { useState, useEffect } from 'react';
import { CheckIcon, ShieldIcon } from '../components/Icons.jsx';
import { getSiteContent } from '../api.js';

export default function Wholesale() {
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    country: 'United Kingdom',
    estimatedOrderValue: '£1,000 - £5,000',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [wholesaleData, setWholesaleData] = useState(() => getSiteContent().wholesale || {});

  useEffect(() => {
    const onContentChange = (e) => {
      setWholesaleData(e.detail?.wholesale || getSiteContent().wholesale || {});
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const benefits = wholesaleData.benefits || [];

  return (
    <div className="container wholesale-page">
      <header className="page-header center">
        <span className="eyebrow">{wholesaleData.eyebrow || 'B2B & TRADE PARTNERSHIPS'}</span>
        <h1>{wholesaleData.title || 'Wholesale Perfume Distribution'}</h1>
        <p className="muted max-prose">
          {wholesaleData.subtitle || 'Partner with Perfume Zone UK (perfumezone.uk) for competitive wholesale pricing on authentic Arabian luxury perfumes, exclusive house creations, and fast UK dispatch.'}
        </p>
      </header>

      {benefits.length > 0 && (
        <div className="wholesale-benefits-grid">
          {benefits.map((b, i) => (
            <div key={b.id || i} className="benefit-card">
              <ShieldIcon />
              <h3>{b.title}</h3>
              <p className="muted">{b.desc}</p>
            </div>
          ))}
        </div>
      )}

      <div className="wholesale-form-card">
        <h2>Submit a Trade Application</h2>
        <p className="muted">Please provide your business credentials below. Our trade account managers review applications within 1–2 business days.</p>

        {submitted ? (
          <div className="wholesale-success-box center">
            <CheckIcon />
            <h3>Trade Inquiry Received</h3>
            <p>Thank you for reaching out to Perfume Zone Wholesale. A dedicated wholesale manager will contact you at <strong>{form.email}</strong> with our wholesale catalog and price list.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="wholesale-form">
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Company / Registered Business Name *</label>
                <input
                  required
                  placeholder="e.g. Mayfair Fragrances Ltd"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Person *</label>
                <input
                  required
                  placeholder="Full name"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label>Business Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="trade@yourcompany.co.uk"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telephone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+44 20 1234 5678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label>Business Website / Social Storefront</label>
                <input
                  placeholder="https://yourstore.co.uk"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Anticipated Initial Order Budget</label>
                <select
                  value={form.estimatedOrderValue}
                  onChange={(e) => setForm({ ...form, estimatedOrderValue: e.target.value })}
                >
                  <option value="£500 - £1,000">£500 – £1,000</option>
                  <option value="£1,000 - £5,000">£1,000 – £5,000</option>
                  <option value="£5,000 - £15,000">£5,000 – £15,000</option>
                  <option value="£15,000+">£15,000+</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Brands or Fragrance Families of Interest</label>
              <textarea
                rows="4"
                placeholder="Tell us which perfume brands (e.g. Afnan, Lattafa, Swiss Arabian, Oud Elixir) or product types (Extrait, EDP, Oils) you are looking to stock..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <button type="submit" className="btn wide">
              Submit Trade Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
