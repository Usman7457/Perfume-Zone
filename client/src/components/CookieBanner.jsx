import { useState } from 'react';
import { Link } from 'react-router-dom';
export default function CookieBanner() {
  const [show, setShow] = useState(() => !localStorage.getItem('cookie'));
  if (!show) return null;
  const close = (v) => { localStorage.setItem('cookie', v); setShow(false); };
  return (
    <div className="cookie" role="dialog" aria-label="Cookie policy">
      <h4>Cookie policy</h4>
      <p>We use cookies and similar technologies to provide the best experience on our website. Refer to our <Link to="/policies/privacy-policy">Privacy Policy</Link> for more information.</p>
      <div><button className="btn" onClick={() => close('yes')}>Accept</button><button className="btn ghost" onClick={() => close('no')}>Decline</button></div>
    </div>
  );
}
