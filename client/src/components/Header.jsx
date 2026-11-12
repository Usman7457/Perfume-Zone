import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { NAV } from '../data/nav.js';
import { useCart } from './CartContext.jsx';
import { useWishlist } from './WishlistContext.jsx';
import { useAuth } from './AuthContext.jsx';
import CountrySelect from './CountrySelect.jsx';
import { SearchIcon, UserIcon, BagIcon, MenuIcon, CloseIcon, PinIcon, HeartIcon } from './Icons.jsx';

export default function Header() {
  const [hover, setHover] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState(null);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const location = useLocation();
  const { count, setOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();

  const closeAll = () => {
    setHover(null);
    setDrawer(false);
    setSearching(false);
  };

  const go = (e) => {
    e.preventDefault();
    if (q.trim()) {
      nav('/search?q=' + encodeURIComponent(q.trim()));
      closeAll();
      setQ('');
    }
  };

  return (
    <header className="header" onMouseLeave={() => setHover(null)}>
      <div className="header-row">
        <button
          type="button"
          className="icon-btn mobile-only"
          aria-label="Open navigation menu"
          onClick={() => setDrawer(true)}
        >
          <MenuIcon />
        </button>

        <div className="header-left desktop-only">
          <Link
            to="/tools/locations"
            className={'header-util-link' + (location.pathname === '/tools/locations' ? ' active' : '')}
            onClick={closeAll}
          >
            <PinIcon />
            <span>UK Boutiques</span>
          </Link>
        </div>

        <Link to="/" className="logo" aria-label="Perfume Zone home" onClick={closeAll}>
          <span className="logo-mark">PERFUME ZONE</span>
          <span className="logo-sub">perfumezone.uk</span>
        </Link>

        <div className="header-actions">
          <CountrySelect className="desktop-only" />
          {isAdmin && (
            <Link
              to="/admin"
              className={'header-admin-pill desktop-only' + (location.pathname.startsWith('/admin') ? ' active' : '')}
              onClick={closeAll}
              title="Open Admin Dashboard"
            >
              Admin
            </Link>
          )}
          <Link
            to="/wishlist"
            className={'icon-btn' + (location.pathname === '/wishlist' ? ' active' : '')}
            aria-label="Wishlist"
            title="Wishlist"
            onClick={closeAll}
          >
            <HeartIcon />
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </Link>
          <Link
            to={isAdmin ? '/admin' : '/account'}
            className={
              'icon-btn desktop-only' +
              (location.pathname.startsWith('/account') || location.pathname.startsWith('/admin') ? ' active' : '')
            }
            aria-label={user ? `Account: ${user.name}` : 'My Account / Sign In'}
            title={user ? `${user.name} (${user.role})` : 'Sign In / My Account'}
            onClick={closeAll}
          >
            <UserIcon />
            {user && <span className="auth-dot" aria-hidden="true" />}
          </Link>
          <button
            className={'icon-btn' + (searching ? ' active' : '')}
            aria-label="Search perfumes"
            title="Search"
            type="button"
            onClick={() => setSearching(!searching)}
          >
            <SearchIcon />
          </button>
          <button
            className="icon-btn cart-btn"
            aria-label="Shopping Cart"
            title="View Cart"
            type="button"
            onClick={() => setOpen(true)}
          >
            <BagIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
      </div>

      <div className="header-nav-bar desktop-only">
        <nav className="main-nav" aria-label="Primary Navigation">
          {NAV.map((n, i) =>
            n.to ? (
              <Link
                key={n.label}
                to={n.to}
                className={'nav-item' + (location.pathname === n.to ? ' active' : '')}
                onMouseEnter={() => setHover(null)}
                onClick={closeAll}
              >
                {n.label}
              </Link>
            ) : (
              <button
                key={n.label}
                type="button"
                className={'nav-item' + (hover === i ? ' active' : '')}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => setHover(hover === i ? null : i)}
              >
                {n.label}
              </button>
            )
          )}
        </nav>
      </div>

      {searching && (
        <form className="search-bar" onSubmit={go}>
          <input
            autoFocus
            placeholder="Search luxury perfumes, oud, brands (e.g. Lattafa, Afnan, Ajmal)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="icon-btn" aria-label="Submit search" type="submit">
            <SearchIcon />
          </button>
        </form>
      )}

      {hover !== null && NAV[hover]?.columns && (
        <div className="mega" onMouseEnter={() => setHover(hover)}>
          <div className="mega-inner">
            {NAV[hover].columns.map((col) => (
              <div key={col.title} className="mega-col">
                <h4>{col.title}</h4>
                {col.links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={location.pathname === l.to ? 'active-link' : ''}
                    onClick={() => {
                      setHover(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
            {NAV[hover].feature && (
              <Link
                to={NAV[hover].feature.to}
                className="mega-feature"
                onClick={() => {
                  setHover(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="ph" />
                <span>{NAV[hover].feature.label}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <div
        className={'drawer-overlay' + (drawer ? ' show' : '')}
        onClick={() => setDrawer(false)}
      />
      <aside
        className={'drawer left' + (drawer ? ' show' : '')}
        aria-hidden={!drawer}
      >
        <div className="drawer-head">
          <CountrySelect />
          <button
            className="icon-btn"
            aria-label="Close"
            type="button"
            onClick={() => setDrawer(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <ul className="mobile-nav">
          {NAV.map((n, i) => (
            <li key={n.label}>
              {n.to ? (
                <Link
                  to={n.to}
                  onClick={() => {
                    setDrawer(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {n.label.toUpperCase()}
                </Link>
              ) : (
                <>
                  <button type="button" onClick={() => setAcc(acc === i ? null : i)}>
                    {n.label.toUpperCase()}
                    <span>{acc === i ? '–' : '+'}</span>
                  </button>
                  {acc === i &&
                    n.columns.map((col) => (
                      <div key={col.title} className="m-group">
                        <h5>{col.title}</h5>
                        {col.links.map((l) => (
                          <Link
                            key={l.to}
                            to={l.to}
                            onClick={() => {
                              setDrawer(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                </>
              )}
            </li>
          ))}
          <li>
            <Link
              to="/wishlist"
              onClick={() => {
                setDrawer(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              WISHLIST {wishlistCount > 0 ? `(${wishlistCount})` : ''}
            </Link>
          </li>
          <li>
            <Link
              to="/tools/locations"
              onClick={() => {
                setDrawer(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              FIND A STORE
            </Link>
          </li>
        </ul>
        <Link
          to={isAdmin ? '/admin' : '/account'}
          className="drawer-login"
          onClick={() => {
            setDrawer(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {isAdmin ? `Admin Dashboard (${user.name})` : user ? `My Account (${user.name})` : 'My Account / Sign In'}
        </Link>
      </aside>
    </header>
  );
}
