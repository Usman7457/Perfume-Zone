import { Link } from 'react-router-dom';

const ARTICLES = [
  {
    id: 1,
    title: 'The Art of Arabian Perfume Layering: How to Combine Oud, Rose & Musk',
    category: 'Fragrance Rituals',
    date: 'February 2026',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    excerpt: 'In Arabian fragrance culture, perfume is never applied as a single note. Discover how layering a pure attar oil with a rich Extrait De Parfum creates a signature trail that is completely your own.'
  },
  {
    id: 2,
    title: 'Extrait De Parfum vs Eau De Parfum: What Concentration Best Suits You?',
    category: 'Scent Education',
    date: 'January 2026',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Demystifying perfume concentration percentages. Discover why Extrait De Parfum boasts 25% to 40% aromatic oils for unsurpassed 16-hour longevity on skin.'
  },
  {
    id: 3,
    title: 'The Mystique of Agarwood: Why Real Oud Remains Liquid Gold',
    category: 'Rare Ingredients',
    date: 'January 2026',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Journey into the heart of wild Aquilaria trees. Understand how precious resin transforms into the most revered, complex aromatic material in the world of high perfumery.'
  },
  {
    id: 4,
    title: '5 Expert Tips to Make Your Fragrance Last All Day',
    category: 'Application Masterclass',
    date: 'December 2025',
    readTime: '3 min read',
    img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    excerpt: 'From pulse point hydration with unscented balm to spraying fabric linings, these professional perfumer secrets ensure your sillage stays vibrant throughout the day and evening.'
  }
];

export default function Blog() {
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
        {ARTICLES.map((article) => (
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
              <Link to="/collections/all" className="link read-more-link">
                Explore Scents in this Article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
