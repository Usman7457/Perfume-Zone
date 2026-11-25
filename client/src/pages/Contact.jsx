import { useState, useEffect } from 'react';
import { PinIcon, CheckIcon } from '../components/Icons.jsx';
import { getSiteContent, submitContactInquiry } from '../api.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Customer Service', message: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [contactData, setContactData] = useState(() => getSiteContent().contact || {});

  useEffect(() => {
    const onContentChange = (e) => {
      setContactData(e.detail?.contact || getSiteContent().contact || {});
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const res = await submitContactInquiry(form);
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.error || 'Failed to send your message. Please try again or email us directly.');
    }
  };

  return (
    <div className="container contact-page">
      <header className="page-header center">
        <h1>{contactData.pageTitle || 'Contact Perfume Zone'}</h1>
        <p className="muted max-prose">
          {contactData.pageSubtitle || 'Our dedicated fragrance concierge team is here to assist you with order inquiries, bespoke scent consultations, and wholesale partnerships.'}
        </p>
      </header>

      <div className="contact-grid">
        {/* Contact Info Cards */}
        <div className="contact-info-column">
          <div className="info-card">
            <h3>{contactData.showroomName || 'Southampton Boutique & Showroom'}</h3>
            <p className="address-lines" style={{ whiteSpace: 'pre-line' }}>
              {contactData.address || 'Perfume Zone\nUnit 38 Marlands Shopping Centre\nCivic Centre Road\nSouthampton\nSO14 7SJ\nUnited Kingdom'}
            </p>
            <p className="hours-lines muted" style={{ whiteSpace: 'pre-line', marginTop: 14 }}>
              <strong>Showroom Hours:</strong><br />
              {contactData.hours || 'Monday – Saturday: 09:30 AM – 5:30 PM\nSunday: 11:00 AM – 5:00 PM'}
            </p>
          </div>

          <div className="info-card">
            <h3>Direct Contact Channels</h3>
            <ul className="direct-channels-list">
              <li>
                <strong>Official Website:</strong>{' '}
                <a href={contactData.website ? (contactData.website.startsWith('http') ? contactData.website : `https://${contactData.website}`) : 'https://perfumezone.uk'} className="link">
                  {contactData.website ? contactData.website.replace(/^https?:\/\//, '') : 'perfumezone.uk'}
                </a>
              </li>
              <li>
                <strong>Customer Support:</strong>{' '}
                <a href={`mailto:${contactData.email || 'support@perfumezone.uk'}`} className="link">
                  {contactData.email || 'support@perfumezone.uk'}
                </a>
              </li>
              <li>
                <strong>Wholesale Inquiries:</strong>{' '}
                <a href={`mailto:${contactData.wholesaleEmail || 'wholesale@perfumezone.uk'}`} className="link">
                  {contactData.wholesaleEmail || 'wholesale@perfumezone.uk'}
                </a>
              </li>
              <li>
                <strong>Telephone (UK):</strong>{' '}
                <a href={`tel:${(contactData.phone || '+442079460991').replace(/\s+/g, '')}`} className="link">
                  {contactData.phone || '+44 (0) 20 7946 0991'}
                </a>
              </li>
            </ul>
          </div>

          <div className="info-card delivery-assurance">
            <h3>Delivery &amp; Customer Promise</h3>
            <p className="muted">
              {contactData.deliveryAssurance || 'All UK orders placed before 2:00 PM Monday through Friday are dispatched on the same business day in signature insulated fragrance boxes.'}
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-column">
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <p className="muted">Fill in the form below and we will respond within 24 business hours.</p>

            {submitted ? (
              <div className="contact-success-box">
                <CheckIcon />
                <h3>Thank You!</h3>
                <p>Your message has been sent to the Perfume Zone team at <strong>{contactData.email || 'support@perfumezone.uk'}</strong>. We will get back to you shortly.</p>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', subject: 'Customer Service', message: '', phone: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="contact-name">Your Full Name *</label>
                  <input
                    id="contact-name"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.co.uk"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone Number <span className="muted small">(Optional)</span></label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+44 7123 456789"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject">Topic / Subject *</label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="Customer Service">Customer Service / General Inquiry</option>
                    <option value="Order Tracking">Order Status &amp; Tracking</option>
                    <option value="Fragrance Advice">Scent Consultation &amp; Recommendations</option>
                    <option value="Wholesale">Wholesale &amp; Retail Distribution</option>
                    <option value="Returns">Returns &amp; Refund Request</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    required
                    rows="5"
                    placeholder="How may our fragrance specialists assist you today?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {errorMsg && (
                  <div style={{ color: '#dc2626', fontSize: '13px', background: '#fee2e2', padding: '10px 14px', borderRadius: '4px' }}>
                    {errorMsg}
                  </div>
                )}

                <button type="submit" className="btn wide" disabled={submitting}>
                  {submitting ? 'Sending Inquiry…' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
