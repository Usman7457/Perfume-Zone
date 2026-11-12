import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Search() {
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (q.trim()) {
      setLoading(true);
      getProducts({ q: q.trim(), limit: 48 })
        .then((r) => {
          if (!ignore) {
            setList(r.products || []);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            setList([]);
            setLoading(false);
          }
        });
    } else {
      setList([]);
      setLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [q]);

  return (
    <div className="container search-results-page">
      <header className="page-header center">
        <span className="eyebrow">CATALOG SEARCH</span>
        <h1>{q ? `Search results for “${q}”` : 'Search Luxury Fragrances'}</h1>
        <p className="muted">
          {q
            ? loading
              ? 'Searching fragrance library…'
              : `${list.length} ${list.length === 1 ? 'fragrance found' : 'fragrances found'}`
            : 'Enter a fragrance name, accord, or brand above.'}
        </p>
      </header>

      {loading ? (
        <div className="center loading-state">
          <p className="empty">Gathering search results…</p>
        </div>
      ) : list.length > 0 ? (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : q ? (
        <div className="center empty-search-state">
          <p className="empty">No fragrances matched your search for “{q}”.</p>
          <div className="empty-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/collections/all" className="btn">Browse All Fragrances</Link>
            <Link to="/collections/best-sellers" className="btn ghost">View Best Sellers</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
