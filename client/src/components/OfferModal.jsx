import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { getSiteSettings } from '../api.js';
import { CloseIcon, CheckIcon } from './Icons.jsx';

export default function OfferModal() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(getSiteSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync settings when modified from Admin CMS
  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getSiteSettings());
    };
    window.addEventListener('pz:settings-change', handleSettingsChange);
    return () => window.removeEventListener('pz:settings-change', handleSettingsChange);
  }, []);

  // Popup logic:
  // 1. Never show if user is signed in (logged in customer or admin)
  // 2. Never show if popup is disabled in CMS
  // 3. Show only on initial page load; once closed, never show on subsequent page-to-page routes
  useEffect(() => {
    // If logged in, do not display
    if (user) return;

    // Check if user already dismissed it during this browser page load session
    if (typeof window !== 'undefined' && window.__pz_offer_popup_dismissed) {
      return;
    }

    if (settings.popupEnabled === false) return;

    // Graceful entrance delay on initial page load
    const timer = setTimeout(() => {
      if (!user && !window.__pz_offer_popup_dismissed) {
        setIsOpen(true);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [user, settings.popupEnabled]);

  // Keyboard accessibility (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.__pz_offer_popup_dismissed = true;
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // If signed in, popup is never rendered
  if (user || !isOpen) return null;

  const title = settings.popupTitle || settings.promoTitle || '10% Off Your First Fragrance';
  const subtitle = settings.popupSubtitle || 'EXCLUSIVE WELCOME PRIVILEGE';
  const description =
    settings.popupDescription ||
    settings.promoDescription ||
    'Unlock instant savings across authentic Dubai luxury perfumes, rare artisan oud, and concentrated attars with code PERFUME10.';
  const code = settings.promoCode || 'PERFUME10';
  const image =
    settings.popupImage ||
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';
  const ctaText = settings.popupCtaText || 'Explore Offers & Save';
  const ctaLink = settings.popupCtaLink || '/collections/all';

  return (
    <div className="offer-popup-backdrop" onClick={handleClose}>
      <div
        className="offer-popup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="offer-popup-close-btn"
          onClick={handleClose}
          aria-label="Close offer announcement"
        >
          <CloseIcon />
        </button>

        {/* Half Image */}
        <div className="offer-popup-media">
          <img src={image} alt={title} loading="eager" decoding="async" />
          <div className="media-overlay-badge">
            <span>PERFUME ZONE UK</span>
          </div>
        </div>

        {/* Half Content */}
        <div className="offer-popup-content">
          <div className="popup-eyebrow">{subtitle}</div>
          <h2 id="offer-popup-title" className="popup-title">{title}</h2>
          <p className="popup-description">{description}</p>

          {/* Promo Code Box */}
          {code && (
            <div className="popup-code-box">
              <div className="code-meta">
                <span className="code-label">PROMO CODE</span>
                <strong className="code-value">{code}</strong>
              </div>
              <button
                type="button"
                className="code-copy-btn"
                onClick={() => handleCopyCode(code)}
              >
                {copied ? (
                  <>
                    <CheckIcon /> Copied
                  </>
                ) : (
                  'Copy Code'
                )}
              </button>
            </div>
          )}

          {/* Action CTA */}
          <Link
            to={ctaLink}
            className="btn popup-cta-btn"
            onClick={handleClose}
          >
            {ctaText} →
          </Link>

          {/* Guarantees */}
          <div className="popup-guarantees">
            <span>✓ Free UK Delivery over £50</span>
            <span>✓ 100% Guaranteed Authentic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
