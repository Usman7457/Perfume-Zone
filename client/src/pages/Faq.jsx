import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../api.js';

export default function Faq() {
  const [openItems, setOpenItems] = useState({});
  const [faqData, setFaqData] = useState(() => getSiteContent().faq || {});

  useEffect(() => {
    const onContentChange = (e) => {
      setFaqData(e.detail?.faq || getSiteContent().faq || {});
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = faqData.categories || [];

  return (
    <div className="container narrow faq-page">
      <header className="page-header center">
        <span className="eyebrow">HELP &amp; ADVICE</span>
        <h1>{faqData.pageTitle || 'Frequently Asked Questions'}</h1>
        <p className="muted">
          {faqData.pageSubtitle || 'Find quick answers about delivery, authenticity, payment, and scent care at perfumezone.uk.'}
        </p>
      </header>

      <div className="faq-sections-list">
        {categories.map((cat, catIdx) => (
          <div key={cat.id || cat.name || catIdx} className="faq-category-block">
            <h2 className="faq-category-title">{cat.name || cat.category}</h2>
            <div className="faq-items-accordion">
              {(cat.items || []).map((item, itemIdx) => {
                const isOpen = !!openItems[`${catIdx}-${itemIdx}`];
                return (
                  <div key={item.id || item.q || itemIdx} className={'faq-accordion-item' + (isOpen ? ' open' : '')}>
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
