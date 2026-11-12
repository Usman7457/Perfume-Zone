import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSiteSettings } from '../api.js';

export default function AnnouncementBar() {
  const [msgs, setMsgs] = useState(() => getSiteSettings().announcements);
  const [i, setI] = useState(0);

  useEffect(() => {
    const sync = () => {
      const next = getSiteSettings().announcements || [];
      setMsgs(next);
      setI(0);
    };
    window.addEventListener('pz:settings-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('pz:settings-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (msgs.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % msgs.length), 4500);
    return () => clearInterval(t);
  }, [msgs]);

  const currentMsg = msgs[i % Math.max(msgs.length, 1)] || '';

  return (
    <div className="announce">
      <div className="announce-inner">
        <div className="announce-msg">
          <button
            aria-label="Previous announcement"
            onClick={() => setI((i + msgs.length - 1) % Math.max(msgs.length, 1))}
          >
            ‹
          </button>
          <span>{currentMsg}</span>
          <button
            aria-label="Next announcement"
            onClick={() => setI((i + 1) % Math.max(msgs.length, 1))}
          >
            ›
          </button>
        </div>
        <div className="announce-links">
          <Link to="/pages/perfume-offers" className="announce-link">
            Special Offers
          </Link>
          <span className="dot-sep">•</span>
          <Link to="/tools/locations" className="announce-link">
            Find a Store
          </Link>
        </div>
      </div>
    </div>
  );
}
