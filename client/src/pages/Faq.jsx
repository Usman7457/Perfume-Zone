import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: 'Orders & Authenticity',
    items: [
      {
        q: 'Are all fragrances on perfumezone.uk 100% authentic?',
        a: 'Yes, without exception. At Perfume Zone (perfumezone.uk), every fragrance we stock is 100% authentic and sourced directly from certified brand headquarters and primary distributors in Dubai and Europe. Each bottle comes in its original sealed manufacturer packaging with verifiable batch codes.'
      },
      {
        q: 'Can I change or cancel my order after placing it?',
        a: 'We process orders quickly to ensure rapid UK delivery. If you need to make changes, please email support@perfumezone.uk within 30 minutes of placing your order with your order number, and our concierge team will do their utmost to accommodate your request.'
      },
      {
        q: 'What payment options do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, PayPal, and Klarna (Pay in 3 installments). We also offer Cash on Delivery for select UK mainland addresses.'
      }
    ]
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'How much does delivery cost, and how fast is it?',
        a: 'We offer FREE UK Delivery on all orders over £50 via Royal Mail Tracked 48 (2–3 business days). For orders under £50, standard shipping is £3.99. We also offer Royal Mail Tracked 24 (Next Business Day) for £5.99.'
      },
      {
        q: 'Do you deliver internationally or to Europe?',
        a: 'Yes, we ship to Ireland, France, Germany, Spain, Netherlands, Poland, and select other European destinations. International shipping rates and times are calculated automatically at checkout.'
      },
      {
        q: 'How can I track my package?',
        a: 'Once your order is dispatched from our London facility, you will receive an email and SMS with your Royal Mail tracking reference and a direct tracking link.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 14-day return policy for unopened, unsealed items in their original factory cellophane condition. Because fragrance is a personal hygiene and cosmetic product, opened or used bottles cannot be returned for hygiene reasons. Please contact support@perfumezone.uk to initiate a return authorization.'
      },
      {
        q: 'What if my bottle arrives damaged or broken?',
        a: 'While our insulated packaging makes transit damage extremely rare, if your item arrives damaged, please send photos of the packaging and bottle to support@perfumezone.uk within 48 hours of receipt, and we will issue an immediate replacement or full refund.'
      }
    ]
  },
  {
    category: 'Fragrance Advice & Care',
    items: [
      {
        q: 'How should I store my perfumes to ensure maximum longevity?',
        a: 'Store your fragrance bottles in a cool, dark, and dry environment away from direct sunlight, extreme heat, and bathroom humidity. Keeping them in their original presentation box is ideal for preserving delicate top notes and essential oils.'
      },
      {
        q: 'What is the difference between Eau De Parfum and Extrait De Parfum?',
        a: 'Extrait De Parfum (Pure Perfume) contains the highest concentration of fragrance oils (typically 20% to 40%), providing richer sillage and up to 12-24 hours of longevity on skin. Eau De Parfum contains between 15% and 20% fragrance oil concentration, ideal for both everyday wear and evening elegance.'
      }
    ]
  }
];

export default function Faq() {
  const [openItems, setOpenItems] = useState({});

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container narrow faq-page">
      <header className="page-header center">
        <span className="eyebrow">HELP &amp; ADVICE</span>
        <h1>Frequently Asked Questions</h1>
        <p className="muted">
          Find quick answers about delivery, authenticity, payment, and scent care at <strong>perfumezone.uk</strong>.
        </p>
      </header>

      <div className="faq-sections-list">
        {FAQS.map((cat, catIdx) => (
          <div key={cat.category} className="faq-category-block">
            <h2 className="faq-category-title">{cat.category}</h2>
            <div className="faq-items-accordion">
              {cat.items.map((item, itemIdx) => {
                const isOpen = !!openItems[`${catIdx}-${itemIdx}`];
                return (
                  <div key={item.q} className={'faq-accordion-item' + (isOpen ? ' open' : '')}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggle(catIdx, itemIdx)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer-body">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-contact-card center">
        <h3>Still have questions?</h3>
        <p className="muted">Our fragrance advisors are ready to assist you anytime.</p>
        <Link to="/pages/contact-us" className="btn">
          Contact Customer Concierge
        </Link>
      </div>
    </div>
  );
}
