import { useEffect, useRef, useState } from 'react';
import { COUNTRIES } from '../data/nav.js';

const STORAGE_KEY = 'perfumezone_country';
const DEFAULT_COUNTRY = 'United Kingdom (GBP £)';

const getCurrencyLabel = (label) => {
  const match = String(label || '').match(/\(([^)]+)\)/);
  return match ? match[1] : label;
};

export default function CountrySelect({ className = '', dropUp = false }) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && COUNTRIES.includes(saved)) return saved;
    } catch {}
    return DEFAULT_COUNTRY;
  });
  const rootRef = useRef(null);

  useEffect(() => {
    const syncCountry = (e) => {
      if (e.detail && COUNTRIES.includes(e.detail)) {
        setCur(e.detail);
      }
    };
    window.addEventListener('pz:country-change', syncCountry);
    return () => window.removeEventListener('pz:country-change', syncCountry);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (country) => {
    setCur(country);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, country);
    } catch {}
    window.dispatchEvent(new CustomEvent('pz:country-change', { detail: country }));
  };

  return (
    <div ref={rootRef} className={className ? `country ${className}` : 'country'}>
      <button
        type="button"
        className="country-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Select shipping country and currency, current ${cur}`}
      >
        <span>{getCurrencyLabel(cur)}</span>
        <span className="country-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className={`country-menu ${dropUp ? 'up' : ''}`} role="listbox">
          {COUNTRIES.map((c) => (
            <li key={c}>
              <button
                type="button"
                role="option"
                aria-selected={c === cur}
                onClick={() => handleSelect(c)}
              >
                <span>{c}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
