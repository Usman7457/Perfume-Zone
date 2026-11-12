import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MSGS = [
  'Free UK delivery on all orders over £50 • perfumezone.uk',
  '100% Genuine Arabian Luxury Perfumes & Rare Oud',
  'Use code PERFUME10 at checkout for 10% off your order'
];

export default function AnnouncementBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (MSGS.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % MSGS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="announce">
      <div className="announce-inner">
        <div className="announce-msg">
          <button
            aria-label="Previous announcement"
            onClick={() => setI((i + MSGS.length - 1) % MSGS.length)}
          >
            ‹
          </button>
          <span>{MSGS[i]}</span>
          <button
            aria-label="Next announcement"
            onClick={() => setI((i + 1) % MSGS.length)}
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
