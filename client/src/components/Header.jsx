import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { NAV, BRAND_COLUMNS, BRAND_FEATURE } from '../data/nav.js';
import { getSiteContent, fetchSiteContentFromBackend } from '../api.js';
import { useCart } from './CartContext.jsx';
import { useWishlist } from './WishlistContext.jsx';
import { useAuth } from './AuthContext.jsx';
import CountrySelect from './CountrySelect.jsx';
import { SearchIcon, UserIcon, BagIcon, MenuIcon, CloseIcon, PinIcon, HeartIcon } from './Icons.jsx';

const ensureColumns = (list) => {
  if (!Array.isArray(list) || !list.length) return NAV;
  return list.map((item) => {
    if (item.columns && Array.isArray(item.columns) && item.columns.length > 0) {
      return item;
    }
    if (item.label?.toUpperCase() === 'BRANDS' || item.to === '/collections/all') {
      return { ...item, columns: BRAND_COLUMNS, feature: BRAND_FEATURE };
    }
    const match = NAV.find((orig) => orig.label?.toLowerCase() === item.label?.toLowerCase());
    if (match?.columns) {
      return { ...item, columns: match.columns, feature: match.feature };
    }
    return item;
  });
};

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

  const [navItems, setNavItems] = useState(() => {
    const cmsNav = getSiteContent().headerNav;
    return ensureColumns(cmsNav);
  });

  useEffect(() => {
    fetchSiteContentFromBackend().then((content) => {
      if (content?.headerNav) {
        setNavItems(ensureColumns(content.headerNav));
      }
    });

    const onContentChange = (e) => {
      const cmsNav = e.detail?.headerNav || getSiteContent().headerNav;
      if (cmsNav) {
        setNavItems(ensureColumns(cmsNav));
      }
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

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
            to="/pages/locations"
            className={'header-util-link' + (location.pathname === '/pages/locations' ? ' active' : '')}
            onClick={closeAll}
          >
            <PinIcon />
            <span>Store Locations</span>
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
            className={'icon-btn desktop-only' + (location.pathname === '/wishlist' ? ' active' : '')}
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
            className={'icon-btn desktop-only' + (searching ? ' active' : '')}
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
          {navItems.map((n, i) =>
            n.columns && n.columns.length > 0 ? (
              <div
                key={n.id || n.label}
                className="nav-dropdown-wrap"
                style={{ display: 'inline-block', position: 'relative' }}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
              >
                <Link
                  to={n.to || '/collections/all'}
                  className={'nav-item' + (hover === i ? ' active' : '') + (location.pathname === n.to ? ' current' : '')}
                  onClick={(e) => {
                    // Clicking on BRANDS toggles the dropdown on desktop without navigating away immediately
                    if (window.innerWidth >= 990) {
                      e.preventDefault();
                      setHover(hover === i ? null : i);
                    } else {
                      closeAll();
                    }
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  {n.label}
                  <svg style={{ width: 8, height: 8, transform: hover === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} viewBox="0 0 19 12" fill="currentColor">
                    <path d="M9.5 12L0 2.5L2.5 0L9.5 7L16.5 0L19 2.5L9.5 12Z" />
                  </svg>
                </Link>
              </div>
            ) : (
              <Link
                key={n.id || n.label}
                to={n.to}
                className={'nav-item' + (location.pathname === n.to ? ' active' : '')}
                onMouseEnter={() => setHover(null)}
                onClick={closeAll}
              >
                {n.label}
              </Link>
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

      {hover !== null && navItems[hover]?.columns && (
        <div
          className="mega"
          onMouseEnter={() => setHover(hover)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="mega-inner">
            {navItems[hover].columns.map((col) => (
              <div key={col.title} className="mega-col">
                <h4>{col.title}</h4>
                {col.links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={location.pathname === l.to ? 'active-link' : ''}
                    onClick={() => {
                      closeAll();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
            {navItems[hover].feature && (
              <Link
                to={navItems[hover].feature.to}
                className="mega-feature"
                onClick={() => {
                  closeAll();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="ph" />
                <span>{navItems[hover].feature.label}</span>
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
          {navItems.map((n, i) => (
            <li key={n.id || n.label}>
              {!n.columns ? (
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
        </ul>

        {/* Search & Utility Icons placed below navbar */}
        <div className="drawer-extra-nav">
          <form className="drawer-search-box" onSubmit={go}>
            <input
              type="search"
              placeholder="Search perfumes, brands..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search perfumes"
            />
            <button type="submit" aria-label="Search">
              <SearchIcon />
            </button>
          </form>

          <div className="drawer-icons-grid">
            <Link
              to="/wishlist"
              className={'drawer-icon-link' + (location.pathname === '/wishlist' ? ' active' : '')}
              onClick={() => {
                setDrawer(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Wishlist"
            >
              <div className="drawer-icon-badge-wrap">
                <HeartIcon />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </div>
              <span>Wishlist</span>
            </Link>

            <Link
              to="/search"
              className={'drawer-icon-link' + (location.pathname === '/search' ? ' active' : '')}
              onClick={() => {
                setDrawer(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Search"
            >
              <div className="drawer-icon-badge-wrap">
                <SearchIcon />
              </div>
              <span>Search</span>
            </Link>

            <Link
              to={isAdmin ? '/admin' : '/account'}
              className={
                'drawer-icon-link' +
                (location.pathname.startsWith('/account') || location.pathname.startsWith('/admin') ? ' active' : '')
              }
              onClick={() => {
                setDrawer(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={isAdmin ? 'Admin Dashboard' : user ? 'My Account' : 'Sign In'}
            >
              <div className="drawer-icon-badge-wrap">
                <UserIcon />
                {user && <span className="auth-dot" aria-hidden="true" />}
              </div>
              <span>{isAdmin ? 'Admin' : user ? 'Account' : 'Sign In'}</span>
            </Link>

            <Link
              to="/tools/locations"
              className={'drawer-icon-link' + (location.pathname === '/tools/locations' ? ' active' : '')}
              onClick={() => {
                setDrawer(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Find a Store"
            >
              <div className="drawer-icon-badge-wrap">
                <PinIcon />
              </div>
              <span>Stores</span>
            </Link>
          </div>
        </div>
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
