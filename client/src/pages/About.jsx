import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSiteContent } from '../api.js';

export default function About() {
  const [aboutData, setAboutData] = useState(() => getSiteContent().about || {});

  useEffect(() => {
    const onContentChange = (e) => {
      setAboutData(e.detail?.about || getSiteContent().about || {});
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  const values = aboutData.values || [];

  return (
    <div className="container about-page">
      <header className="page-header center">
        <span className="eyebrow">{aboutData.eyebrow || 'OUR HERITAGE & PASSION'}</span>
        <h1>{aboutData.title || 'Welcome to Perfume Zone'}</h1>
        <p className="lead-text max-prose">
          {aboutData.leadText || "Born from an obsession with rare aromas and rich Arabian heritage, Perfume Zone brings the world's most evocative fragrances directly to fragrance lovers across the United Kingdom."}
        </p>
      </header>

      {aboutData.heroImage && (
        <div className="about-hero-image-box">
          <img
            src={aboutData.heroImage}
            alt={aboutData.title || 'Perfume Zone Luxury Collection'}
            className="about-hero-banner"
          />
        </div>
      )}

      <div className="about-story-content">
        <div className="prose about-story-text">
          <h2>{aboutData.storyHeading || 'The Perfume Zone Story'}</h2>
          <p>{aboutData.storyParagraph1}</p>
          {aboutData.storyParagraph2 && <p>{aboutData.storyParagraph2}</p>}
        </div>

        {values.length > 0 && (
          <div className="about-values-grid">
            {values.map((v, i) => (
              <div key={v.id || i} className="value-card">
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        )}

        {aboutData.dispatchTitle && (
          <div className="prose about-story-text">
            <h2>{aboutData.dispatchTitle}</h2>
            <p>{aboutData.dispatchText}</p>
          </div>
        )}

        <div className="about-cta-banner">
          <h3>{aboutData.ctaHeading || 'Discover Your New Signature Fragrance'}</h3>
          <p>{aboutData.ctaSubheading || 'Explore our latest arrivals, bestsellers, and exclusive private blends today.'}</p>
          <div className="about-cta-buttons">
            <Link to="/collections/all" className="btn light">Shop The Collection</Link>
            <Link to="/pages/contact-us" className="btn ghost light-ghost">Speak with an Advisor</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
