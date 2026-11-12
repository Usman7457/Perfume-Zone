import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts, getCollection, getCollectionSync } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Collection() {
  const { handle = 'all' } = useParams();
  const [sp, setSp] = useSearchParams();
  const sort = sp.get('sort_by') || 'manual';
  const brandFilter = sp.get('brand') || '';

  // Synchronously compute initial metadata so title & description render on frame 1
  const [col, setCol] = useState(() => getCollectionSync(handle));
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);

  // Sync collection metadata when handle changes
  useEffect(() => {
    let ignore = false;
    const initial = getCollectionSync(handle);
    setCol(initial);

    getCollection(handle)
      .then((updated) => {
        if (!ignore && updated) {
          setCol(updated);
        }
      })
      .catch(() => { });

    return () => {
      ignore = true;
    };
  }, [handle]);

  // Fetch products with race condition protection
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    getProducts({
      collection: handle,
      brand: brandFilter,
      sort,
      page: 1,
      limit: 24
    })
      .then((r) => {
        if (!ignore) {
          setList(r.products);
          setMeta(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [handle, sort, brandFilter]);

  const more = () => {
    getProducts({
      collection: handle,
      brand: brandFilter,
      sort,
      page: meta.page + 1,
      limit: 24
    }).then((r) => {
      setList((l) => [...l, ...r.products]);
      setMeta(r);
    });
  };

  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(sp);
    next.set('sort_by', newSort);
    setSp(next);
  };

  const handleBrandChange = (newBrand) => {
    const next = new URLSearchParams(sp);
    if (newBrand) {
      next.set('brand', newBrand);
    } else {
      next.delete('brand');
    }
    setSp(next);
  };

  return (
    <div className="container collection-page">
      {/* Breadcrumb Navigation */}
      <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/collections/all">Collections</Link>
        <span>/</span>
        <span className="current">{col?.title || 'Fragrance Collection'}</span>
      </nav>

      <header className="col-head">
        <span className="eyebrow">PERFUME ZONE CURATION</span>
        <h1>{col?.title || 'Fragrance Collection'}</h1>
        {col?.description && <p className="col-subtext max-prose muted">{col.description}</p>}
      </header>

      {/* Toolbar with filter & sorting */}
      <div className="toolbar collection-toolbar">
        <div className="toolbar-left">
          <span className="products-count-badge">
            {meta.total} {meta.total === 1 ? 'Fragrance' : 'Fragrances'}
          </span>
        </div>

        <div className="toolbar-controls">
          {/* Brand Filter */}
          <label className="toolbar-filter-item">
            <span>Brand:</span>
            <select
              value={brandFilter}
              onChange={(e) => handleBrandChange(e.target.value)}
            >
              <option value="">All Brands</option>
              <option value="Afnan">Afnan</option>
              <option value="Ajmal">Ajmal</option>
              <option value="Ard Al Zaafaran">Ard Al Zaafaran</option>
              <option value="Blends of Dubai">Blends of Dubai</option>
              <option value="Essential Perfume">Essential Perfume</option>
              <option value="Gulf Orchid">Gulf Orchid</option>
              <option value="Lattafa">Lattafa</option>
              <option value="Oud Elixir">Oud Elixir</option>
              <option value="Rasasi">Rasasi</option>
              <option value="Rayhaan">Rayhaan</option>
              <option value="Rue Broca">Rue Broca</option>
              <option value="Swiss Arabian">Swiss Arabian</option>
              <option value="Viali">Viali</option>
              <option value="Zimaya">Zimaya</option>
            </select>
          </label>

          {/* Sort By */}
          <label className="toolbar-filter-item">
            <span>Sort by:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="manual">Featured</option>
              <option value="price-ascending">Price: Low to High</option>
              <option value="price-descending">Price: High to Low</option>
              <option value="title-ascending">Alphabetically: A–Z</option>
              <option value="title-descending">Alphabetically: Z–A</option>
              <option value="created-descending">Newest Releases</option>
            </select>
          </label>
        </div>
      </div>

      {loading && !list.length ? (
        <div className="center loading-state">
          <p className="empty">Gathering fragrance collection…</p>
        </div>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {!loading && !list.length && (
        <div className="center empty-collection-state">
          <p className="empty">No fragrances match your selected filters in this collection.</p>
          <div className="empty-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {brandFilter && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => setSp({})}
              >
                Clear Brand Filter
              </button>
            )}
            <Link to="/collections/all" className="btn">
              Browse All Fragrances
            </Link>
          </div>
        </div>
      )}

      {meta.page < meta.pages && (
        <div className="center load-more-wrapper">
          <button type="button" className="btn ghost" onClick={more}>
            Load More Fragrances
          </button>
        </div>
      )}
    </div>
  );
}
