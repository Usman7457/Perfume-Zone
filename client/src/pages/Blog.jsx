import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogs } from '../api.js';

export default function Blog() {
  const [articles, setArticles] = useState(() => getBlogs());
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    const sync = () => setArticles(getBlogs());
    window.addEventListener('pz:blogs-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('pz:blogs-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <div className="container blog-page">
      <header className="page-header center">
        <span className="eyebrow">THE PERFUME ZONE JOURNAL</span>
        <h1>Fragrance Insights</h1>
        <p className="muted max-prose">
          Explore olfactory guides, scent pairing masterclasses, and stories from the historic perfume houses of Dubai and Europe on <strong>perfumezone.uk</strong>.
        </p>
      </header>

      <div className="blog-grid">
        {articles.map((article) => (
          <article key={article.id} className="blog-card">
            <div className="blog-thumb-wrap">
              <img src={article.img} alt={article.title} loading="lazy" />
              <span className="blog-category-tag">{article.category}</span>
            </div>
            <div className="blog-card-content">
              <div className="blog-meta muted">
                <span>{article.date}</span> • <span>{article.readTime}</span>
              </div>
              <h2 className="blog-title">{article.title}</h2>
              <p className="blog-excerpt muted">{article.excerpt}</p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 6 }}>
                <button
                  type="button"
                  className="link-inline-btn"
                  style={{ fontWeight: 600 }}
                  onClick={() => setActiveArticle(article)}
                >
                  Read Full Article →
                </button>
                <Link to="/collections/all" className="link read-more-link">
                  Explore Scents
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {activeArticle && (
        <div
          className="blog-reader-backdrop"
          onClick={() => setActiveArticle(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="blog-reader-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="blog-reader-close"
              onClick={() => setActiveArticle(null)}
              aria-label="Close article"
            >
              ×
            </button>
            {activeArticle.img && (
              <img src={activeArticle.img} alt={activeArticle.title} className="blog-reader-img" />
            )}
            <div className="blog-reader-body">
              <span className="eyebrow">{activeArticle.category}</span>
              <h2>{activeArticle.title}</h2>
              <p className="muted small" style={{ marginBottom: 18 }}>
                {activeArticle.date} • {activeArticle.readTime}
              </p>
              <div className="blog-reader-prose">
                {(activeArticle.content || activeArticle.excerpt || '')
                  .split('\n\n')
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Link to="/collections/all" className="btn" onClick={() => setActiveArticle(null)}>
                  Shop Featured Perfumes
                </Link>
                <button type="button" className="btn ghost" onClick={() => setActiveArticle(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
