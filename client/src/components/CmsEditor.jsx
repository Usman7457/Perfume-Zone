import { useState, useEffect } from 'react';
import { getSiteContent, saveSiteContent, resetSiteContent } from '../api.js';
import { ShieldIcon, TruckIcon, LockIcon, CheckIcon } from './Icons.jsx';
import ImageUploadField from './ImageUploadField.jsx';

const SUB_TABS = [
  { id: 'home', label: '🏠 Home Page', desc: 'Hero carousel slides, middle promotional banner, and trust badges.' },
  { id: 'nav', label: '🧭 Header Navigation', desc: 'Navbar links, ordering, and target routes.' },
  { id: 'footer', label: '⚓ Footer & Links', desc: 'Brand blurb, contact info, social links, and footer navigation columns.' },
  { id: 'contact', label: '📞 Contact Us', desc: 'Showroom address, hours, direct emails, phone, and delivery assurance.' },
  { id: 'about', label: '📖 About Us', desc: 'Story paragraphs, brand values, hero banner image, and mission.' },
  { id: 'faq', label: '❓ FAQ Page', desc: 'Frequently asked questions, answers, and category groupings.' },
  { id: 'wholesale', label: '💼 Wholesale (B2B)', desc: 'Wholesale headline, distributor perks, and B2B contact channels.' }
];

export default function CmsEditor({ notify }) {
  const [activeSubTab, setActiveSubTab] = useState('home');
  const [cms, setCms] = useState(() => getSiteContent());
  const [newNavLink, setNewNavLink] = useState({ label: '', to: '' });
  const [newFaqCat, setNewFaqCat] = useState('');

  useEffect(() => {
    const onContentChange = (e) => {
      setCms(e.detail || getSiteContent());
    };
    window.addEventListener('pz:content-change', onContentChange);
    return () => window.removeEventListener('pz:content-change', onContentChange);
  }, []);

  const saveSection = (sectionName, friendlyLabel) => {
    saveSiteContent(sectionName, cms[sectionName]);
    notify?.(`Saved ${friendlyLabel || sectionName} changes live.`);
  };

  const handleResetSection = (sectionName, friendlyLabel) => {
    if (window.confirm(`Reset ${friendlyLabel || sectionName} to default content? Any custom edits in this section will be overwritten.`)) {
      const reset = resetSiteContent(sectionName);
      setCms(reset);
      notify?.(`Reset ${friendlyLabel || sectionName} to factory defaults.`);
    }
  };

  // ----------------------------------------------------
  // Home Helpers
  // ----------------------------------------------------
  const updateHeroSlide = (idx, field, val) => {
    const slides = [...(cms.home?.heroSlides || [])];
    slides[idx] = { ...slides[idx], [field]: val };
    setCms({ ...cms, home: { ...cms.home, heroSlides: slides } });
  };

  const addHeroSlide = () => {
    const slides = [
      ...(cms.home?.heroSlides || []),
      {
        id: `slide-${Date.now()}`,
        title: 'New Luxury Fragrance Collection',
        subtitle: 'Artisanal extrait concentration crafted with pure oud and rare blossoms.',
        cta: 'Explore Collection',
        to: '/collections/all',
        bg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80'
      }
    ];
    setCms({ ...cms, home: { ...cms.home, heroSlides: slides } });
  };

  const deleteHeroSlide = (idx) => {
    if ((cms.home?.heroSlides || []).length <= 1) {
      alert('You must have at least one hero slide on the Home Page.');
      return;
    }
    const slides = (cms.home?.heroSlides || []).filter((_, i) => i !== idx);
    setCms({ ...cms, home: { ...cms.home, heroSlides: slides } });
  };

  const updateMiddleBanner = (field, val) => {
    setCms({
      ...cms,
      home: {
        ...cms.home,
        middleBanner: { ...(cms.home?.middleBanner || {}), [field]: val }
      }
    });
  };

  const updateTrustBadge = (idx, field, val) => {
    const badges = [...(cms.home?.trustBadges || [])];
    badges[idx] = { ...badges[idx], [field]: val };
    setCms({ ...cms, home: { ...cms.home, trustBadges: badges } });
  };

  // ----------------------------------------------------
  // Navigation Helpers
  // ----------------------------------------------------
  const updateNavRow = (idx, field, val) => {
    const nav = [...(cms.headerNav || [])];
    nav[idx] = { ...nav[idx], [field]: val };
    setCms({ ...cms, headerNav: nav });
  };

  const moveNavRow = (idx, dir) => {
    const nav = [...(cms.headerNav || [])];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= nav.length) return;
    const temp = nav[idx];
    nav[idx] = nav[targetIdx];
    nav[targetIdx] = temp;
    setCms({ ...cms, headerNav: nav });
  };

  const deleteNavRow = (idx) => {
    if ((cms.headerNav || []).length <= 1) {
      alert('You must have at least one link in the navbar.');
      return;
    }
    const nav = (cms.headerNav || []).filter((_, i) => i !== idx);
    setCms({ ...cms, headerNav: nav });
  };

  const handleAddNavLink = (e) => {
    e.preventDefault();
    if (!newNavLink.label.trim() || !newNavLink.to.trim()) return;
    const nav = [
      ...(cms.headerNav || []),
      {
        id: `nav-${Date.now()}`,
        label: newNavLink.label.trim().toUpperCase(),
        to: newNavLink.to.trim()
      }
    ];
    setCms({ ...cms, headerNav: nav });
    setNewNavLink({ label: '', to: '' });
    notify?.(`Added "${newNavLink.label}" to navigation links.`);
  };

  // ----------------------------------------------------
  // Footer Helpers
  // ----------------------------------------------------
  const updateFooterField = (field, val) => {
    setCms({
      ...cms,
      footer: { ...(cms.footer || {}), [field]: val }
    });
  };

  const updateFooterLink = (listKey, idx, field, val) => {
    const list = [...(cms.footer?.[listKey] || [])];
    list[idx] = { ...list[idx], [field]: val };
    setCms({ ...cms, footer: { ...cms.footer, [listKey]: list } });
  };

  const addFooterLink = (listKey) => {
    const list = [
      ...(cms.footer?.[listKey] || []),
      { label: 'New Link', to: '/collections/all' }
    ];
    setCms({ ...cms, footer: { ...cms.footer, [listKey]: list } });
  };

  const deleteFooterLink = (listKey, idx) => {
    const list = (cms.footer?.[listKey] || []).filter((_, i) => i !== idx);
    setCms({ ...cms, footer: { ...cms.footer, [listKey]: list } });
  };

  // ----------------------------------------------------
  // Contact Helpers
  // ----------------------------------------------------
  const updateContactField = (field, val) => {
    setCms({
      ...cms,
      contact: { ...(cms.contact || {}), [field]: val }
    });
  };

  // ----------------------------------------------------
  // About Helpers
  // ----------------------------------------------------
  const updateAboutField = (field, val) => {
    setCms({
      ...cms,
      about: { ...(cms.about || {}), [field]: val }
    });
  };

  const updateAboutValue = (idx, field, val) => {
    const values = [...(cms.about?.values || [])];
    values[idx] = { ...values[idx], [field]: val };
    setCms({ ...cms, about: { ...cms.about, values } });
  };

  const addAboutValue = () => {
    const values = [
      ...(cms.about?.values || []),
      { id: `v-${Date.now()}`, title: 'Brand Value Title', desc: 'Description of the brand value or craft.' }
    ];
    setCms({ ...cms, about: { ...cms.about, values } });
  };

  const deleteAboutValue = (idx) => {
    const values = (cms.about?.values || []).filter((_, i) => i !== idx);
    setCms({ ...cms, about: { ...cms.about, values } });
  };

  // ----------------------------------------------------
  // FAQ Helpers
  // ----------------------------------------------------
  const updateFaqField = (field, val) => {
    setCms({
      ...cms,
      faq: { ...(cms.faq || {}), [field]: val }
    });
  };

  const addFaqCategory = (e) => {
    e.preventDefault();
    if (!newFaqCat.trim()) return;
    const cats = [
      ...(cms.faq?.categories || []),
      {
        id: `faq-cat-${Date.now()}`,
        name: newFaqCat.trim(),
        items: []
      }
    ];
    setCms({ ...cms, faq: { ...cms.faq, categories: cats } });
    setNewFaqCat('');
  };

  const deleteFaqCategory = (catIdx) => {
    if (!window.confirm('Delete this entire FAQ category and all its questions?')) return;
    const cats = (cms.faq?.categories || []).filter((_, i) => i !== catIdx);
    setCms({ ...cms, faq: { ...cms.faq, categories: cats } });
  };

  const updateFaqQuestion = (catIdx, itemIdx, field, val) => {
    const cats = [...(cms.faq?.categories || [])];
    const cat = { ...cats[catIdx] };
    const items = [...(cat.items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    cat.items = items;
    cats[catIdx] = cat;
    setCms({ ...cms, faq: { ...cms.faq, categories: cats } });
  };

  const addFaqQuestion = (catIdx) => {
    const cats = [...(cms.faq?.categories || [])];
    const cat = { ...cats[catIdx] };
    const items = [
      ...(cat.items || []),
      {
        id: `faq-${Date.now()}`,
        q: 'New Question Title?',
        a: 'Detailed answer explaining the policy, advice, or instruction.'
      }
    ];
    cat.items = items;
    cats[catIdx] = cat;
    setCms({ ...cms, faq: { ...cms.faq, categories: cats } });
  };

  const deleteFaqQuestion = (catIdx, itemIdx) => {
    const cats = [...(cms.faq?.categories || [])];
    const cat = { ...cats[catIdx] };
    cat.items = (cat.items || []).filter((_, i) => i !== itemIdx);
    cats[catIdx] = cat;
    setCms({ ...cms, faq: { ...cms.faq, categories: cats } });
  };

  // ----------------------------------------------------
  // Wholesale Helpers
  // ----------------------------------------------------
  const updateWholesaleField = (field, val) => {
    setCms({
      ...cms,
      wholesale: { ...(cms.wholesale || {}), [field]: val }
    });
  };

  const updateWholesaleBenefit = (idx, field, val) => {
    const benefits = [...(cms.wholesale?.benefits || [])];
    benefits[idx] = { ...benefits[idx], [field]: val };
    setCms({ ...cms, wholesale: { ...cms.wholesale, benefits } });
  };

  const addWholesaleBenefit = () => {
    const benefits = [
      ...(cms.wholesale?.benefits || []),
      { id: `wb-${Date.now()}`, title: 'Trade Advantage', desc: 'Explanation of trade benefits for B2B partners.' }
    ];
    setCms({ ...cms, wholesale: { ...cms.wholesale, benefits } });
  };

  const deleteWholesaleBenefit = (idx) => {
    const benefits = (cms.wholesale?.benefits || []).filter((_, i) => i !== idx);
    setCms({ ...cms, wholesale: { ...cms.wholesale, benefits } });
  };

  const currentTabMeta = SUB_TABS.find((t) => t.id === activeSubTab) || SUB_TABS[0];

  return (
    <div className="dash-stack cms-editor-wrapper">
      <div className="dash-card">
        <div className="dash-card-head">
          <div>
            <span className="eyebrow">Front-End Content Management System</span>
            <h2>Website Pages &amp; Navigation CMS</h2>
            <p className="muted small" style={{ margin: 0 }}>
              Edit all text content, banner graphics, contact details, FAQs, and navigation links. Changes persist directly into JSON format.
            </p>
          </div>
          <div className="dash-card-actions">
            <button
              type="button"
              className="btn ghost btn-sm"
              onClick={() => handleResetSection(activeSubTab, currentTabMeta.label)}
            >
              Reset Section Defaults
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => saveSection(activeSubTab, currentTabMeta.label)}
            >
              Save {currentTabMeta.label.split(' ')[1] || 'Section'} Changes
            </button>
          </div>
        </div>

        {/* CMS Sub-Tabs Bar */}
        <div className="cms-subtabs-nav" role="tablist">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSubTab === tab.id}
              className={'cms-subtab-btn' + (activeSubTab === tab.id ? ' active' : '')}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prominent Golden Active Page Banner */}
        <div className="cms-active-page-banner">
          <div className="cms-active-page-indicator">
            <span className="cms-gold-dot" aria-hidden="true"></span>
            <span className="cms-active-label">Currently Editing:</span>
            <strong className="cms-active-name">{currentTabMeta.label}</strong>
          </div>
          <span className="cms-active-desc">{currentTabMeta.desc}</span>
        </div>
      </div>

      {/* SUB-TAB 1: HOME PAGE */}
      {activeSubTab === 'home' && (
        <div className="dash-stack">
          {/* Hero Slides */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Above The Fold</span>
                <h3>Hero Carousel Slides ({(cms.home?.heroSlides || []).length})</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Customize the full-width high-resolution slides shown at the top of the Home Page.
                </p>
              </div>
              <button type="button" className="btn btn-sm" onClick={addHeroSlide}>
                + Add New Slide
              </button>
            </div>

            <div className="cms-items-grid">
              {(cms.home?.heroSlides || []).map((slide, idx) => (
                <div key={slide.id || idx} className="cms-item-card">
                  <div className="cms-item-card-header">
                    <span className="cms-badge">Slide #{idx + 1}</span>
                    <button
                      type="button"
                      className="link-inline-btn danger"
                      onClick={() => deleteHeroSlide(idx)}
                    >
                      Delete Slide
                    </button>
                  </div>

                  <div className="cms-card-split">
                    <div className="cms-preview-col">
                      <ImageUploadField
                        label="Slide Background Image"
                        value={slide.bg || ''}
                        onChange={(img) => updateHeroSlide(idx, 'bg', img)}
                        previewHeight={170}
                        helpText="Choose image file from computer or edit web URL"
                      />
                    </div>

                    <div className="cms-fields-col">
                      <div className="form-group">
                        <label>Slide Main Headline *</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={(e) => updateHeroSlide(idx, 'title', e.target.value)}
                          placeholder="e.g. Arabian Luxury & Rare Oud"
                        />
                      </div>

                      <div className="form-group">
                        <label>Slide Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle || ''}
                          onChange={(e) => updateHeroSlide(idx, 'subtitle', e.target.value)}
                          placeholder="Subtitle text..."
                        />
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Button CTA Label</label>
                          <input
                            type="text"
                            value={slide.cta || ''}
                            onChange={(e) => updateHeroSlide(idx, 'cta', e.target.value)}
                            placeholder="e.g. Explore All Scents"
                          />
                        </div>
                        <div className="form-group">
                          <label>Button Target URL / Route</label>
                          <input
                            type="text"
                            value={slide.to || ''}
                            onChange={(e) => updateHeroSlide(idx, 'to', e.target.value)}
                            placeholder="e.g. /collections/all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Promo Banner */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Middle Page Feature</span>
                <h3>Middle Promotional Banner</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Displayed between featured fragrance collections on the Home Page.
                </p>
              </div>
            </div>

            <div className="cms-card-split" style={{ marginTop: 12 }}>
              <div className="cms-preview-col">
                <ImageUploadField
                  label="Banner Background Image"
                  value={cms.home?.middleBanner?.bg || ''}
                  onChange={(img) => updateMiddleBanner('bg', img)}
                  previewHeight={160}
                  helpText="Choose image file from computer or edit web URL"
                />
              </div>

              <div className="cms-fields-col">
                <div className="form-group">
                  <label>Banner Headline</label>
                  <input
                    type="text"
                    value={cms.home?.middleBanner?.title || ''}
                    onChange={(e) => updateMiddleBanner('title', e.target.value)}
                    placeholder="e.g. Experience Arabian Splendour with 10% Off"
                  />
                </div>
                <div className="form-group">
                  <label>Banner Subtitle</label>
                  <textarea
                    rows={2}
                    value={cms.home?.middleBanner?.subtitle || ''}
                    onChange={(e) => updateMiddleBanner('subtitle', e.target.value)}
                    placeholder="Use discount coupon PERFUME10 at checkout..."
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Button Text</label>
                    <input
                      type="text"
                      value={cms.home?.middleBanner?.cta || ''}
                      onChange={(e) => updateMiddleBanner('cta', e.target.value)}
                      placeholder="e.g. Discover Exclusive Offers"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target URL</label>
                    <input
                      type="text"
                      value={cms.home?.middleBanner?.to || ''}
                      onChange={(e) => updateMiddleBanner('to', e.target.value)}
                      placeholder="e.g. /pages/perfume-offers"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Trust &amp; Assurance</span>
                <h3>Storefront Trust Badges (3 items)</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Showcased at the bottom of the Home Page and above the footer.
                </p>
              </div>
            </div>

            <div className="form-row-3" style={{ marginTop: 14 }}>
              {(cms.home?.trustBadges || []).map((badge, idx) => (
                <div key={badge.id || idx} className="cms-badge-edit-box">
                  <div className="cms-badge-top">
                    {badge.icon === 'shield' ? <ShieldIcon /> : badge.icon === 'lock' ? <LockIcon /> : <TruckIcon />}
                    <strong>Badge #{idx + 1}</strong>
                  </div>
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label>Icon Type</label>
                    <select
                      value={badge.icon || 'truck'}
                      onChange={(e) => updateTrustBadge(idx, 'icon', e.target.value)}
                    >
                      <option value="truck">Delivery Truck (TruckIcon)</option>
                      <option value="shield">Authenticity Shield (ShieldIcon)</option>
                      <option value="lock">Security Lock (LockIcon)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={badge.title || ''}
                      onChange={(e) => updateTrustBadge(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={badge.desc || ''}
                      onChange={(e) => updateTrustBadge(idx, 'desc', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-panel-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('home', 'Home Page')}
              >
                Save Home Page Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: HEADER NAVIGATION */}
      {activeSubTab === 'nav' && (
        <div className="dash-stack">
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Primary Navigation Bar</span>
                <h3>Navbar Links Management ({(cms.headerNav || []).length} Links)</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Change menu link titles, URLs, and display order. Immediately updates both desktop menu and mobile drawer.
                </p>
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="cms-nav-preview-bar">
              <span className="cms-preview-label">Live Navbar Preview:</span>
              <div className="cms-nav-preview-list">
                {(cms.headerNav || []).map((n) => (
                  <span key={n.id || n.label} className="cms-nav-pill">
                    {n.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Add New Link Form */}
            <form onSubmit={handleAddNavLink} className="cms-add-nav-form">
              <h4>+ Add New Navigation Link</h4>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Menu Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER SALE or SPECIAL OFFERS"
                    value={newNavLink.label}
                    onChange={(e) => setNewNavLink({ ...newNavLink, label: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Route URL / Target Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /collections/sale or /pages/about-us"
                    value={newNavLink.to}
                    onChange={(e) => setNewNavLink({ ...newNavLink, to: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-sm">Add To Menu</button>
            </form>

            {/* Existing Links List */}
            <div className="admin-table-wrap" style={{ marginTop: 16 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Order</th>
                    <th>Label</th>
                    <th>Route / URL</th>
                    <th className="th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(cms.headerNav || []).map((navRow, idx) => (
                    <tr key={navRow.id || idx}>
                      <td data-label="Order">
                        <div className="cms-order-actions">
                          <button
                            type="button"
                            className="cms-arrow-btn"
                            disabled={idx === 0}
                            onClick={() => moveNavRow(idx, -1)}
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="cms-arrow-btn"
                            disabled={idx === (cms.headerNav || []).length - 1}
                            onClick={() => moveNavRow(idx, 1)}
                            title="Move Down"
                          >
                            ▼
                          </button>
                          <span className="muted small" style={{ marginLeft: 4 }}>#{idx + 1}</span>
                        </div>
                      </td>
                      <td data-label="Label">
                        <input
                          type="text"
                          className="cms-inline-input"
                          value={navRow.label || ''}
                          onChange={(e) => updateNavRow(idx, 'label', e.target.value)}
                        />
                      </td>
                      <td data-label="Route / URL">
                        <input
                          type="text"
                          className="cms-inline-input"
                          value={navRow.to || ''}
                          onChange={(e) => updateNavRow(idx, 'to', e.target.value)}
                        />
                      </td>
                      <td className="td-right" data-label="Actions">
                        <button
                          type="button"
                          className="btn ghost danger-btn btn-sm"
                          onClick={() => deleteNavRow(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-panel-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('headerNav', 'Navigation Links')}
              >
                Save Navigation Links
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FOOTER */}
      {activeSubTab === 'footer' && (
        <div className="dash-stack">
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Footer Details</span>
                <h3>Brand Identity &amp; Contact Channels</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Customize the brand description, direct contact info, and copyright statement.
                </p>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label>Company / Brand Name</label>
                <input
                  type="text"
                  value={cms.footer?.companyName || ''}
                  onChange={(e) => updateFooterField('companyName', e.target.value)}
                  placeholder="Perfume Zone UK"
                />
              </div>
              <div className="form-group">
                <label>Official Website URL</label>
                <input
                  type="text"
                  value={cms.footer?.contactWebsite || ''}
                  onChange={(e) => updateFooterField('contactWebsite', e.target.value)}
                  placeholder="https://perfumezone.uk"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Footer About / Brand Blurb</label>
              <textarea
                rows={2}
                value={cms.footer?.aboutText || ''}
                onChange={(e) => updateFooterField('aboutText', e.target.value)}
                placeholder="The UK's premier destination for luxurious Arabian perfumes..."
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Support Email Address</label>
                <input
                  type="email"
                  value={cms.footer?.contactEmail || ''}
                  onChange={(e) => updateFooterField('contactEmail', e.target.value)}
                  placeholder="support@perfumezone.uk"
                />
              </div>
              <div className="form-group">
                <label>Support Telephone Number</label>
                <input
                  type="text"
                  value={cms.footer?.contactPhone || ''}
                  onChange={(e) => updateFooterField('contactPhone', e.target.value)}
                  placeholder="+44 (0) 20 7946 0991"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Copyright Statement</label>
              <input
                type="text"
                value={cms.footer?.copyrightText || ''}
                onChange={(e) => updateFooterField('copyrightText', e.target.value)}
                placeholder="© 2026 Perfume Zone UK. All rights reserved."
              />
            </div>
          </div>

          {/* Footer Quick Links Columns */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Link Columns</span>
                <h3>Footer Navigation Columns</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Manage the Company and Legal &amp; Policies columns in the website footer.
                </p>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 14 }}>
              {/* Company Links */}
              <div className="cms-column-box">
                <div className="cms-column-head">
                  <h4>Company Links ({(cms.footer?.companyLinks || []).length})</h4>
                  <button type="button" className="btn ghost btn-sm" onClick={() => addFooterLink('companyLinks')}>
                    + Add Link
                  </button>
                </div>
                {(cms.footer?.companyLinks || []).map((link, idx) => (
                  <div key={idx} className="cms-link-row">
                    <input
                      type="text"
                      className="cms-inline-input"
                      placeholder="Label"
                      value={link.label || ''}
                      onChange={(e) => updateFooterLink('companyLinks', idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="cms-inline-input"
                      placeholder="Target Path (/pages/...)"
                      value={link.to || ''}
                      onChange={(e) => updateFooterLink('companyLinks', idx, 'to', e.target.value)}
                    />
                    <button
                      type="button"
                      className="cms-icon-btn danger"
                      onClick={() => deleteFooterLink('companyLinks', idx)}
                      title="Remove Link"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Legal Links */}
              <div className="cms-column-box">
                <div className="cms-column-head">
                  <h4>Legal &amp; Policies Links ({(cms.footer?.legalLinks || []).length})</h4>
                  <button type="button" className="btn ghost btn-sm" onClick={() => addFooterLink('legalLinks')}>
                    + Add Link
                  </button>
                </div>
                {(cms.footer?.legalLinks || []).map((link, idx) => (
                  <div key={idx} className="cms-link-row">
                    <input
                      type="text"
                      className="cms-inline-input"
                      placeholder="Label"
                      value={link.label || ''}
                      onChange={(e) => updateFooterLink('legalLinks', idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="cms-inline-input"
                      placeholder="Target Path (/policies/...)"
                      value={link.to || ''}
                      onChange={(e) => updateFooterLink('legalLinks', idx, 'to', e.target.value)}
                    />
                    <button
                      type="button"
                      className="cms-icon-btn danger"
                      onClick={() => deleteFooterLink('legalLinks', idx)}
                      title="Remove Link"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-panel-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('footer', 'Footer & Links')}
              >
                Save Footer Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONTACT US */}
      {activeSubTab === 'contact' && (
        <div className="dash-stack">
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Contact Page Settings</span>
                <h3>Boutique Showroom &amp; Direct Channels</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Controls the information presented on <code>/pages/contact</code> and <code>/pages/contact-us</code>.
                </p>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label>Page Header Title</label>
                <input
                  type="text"
                  value={cms.contact?.pageTitle || ''}
                  onChange={(e) => updateContactField('pageTitle', e.target.value)}
                  placeholder="Contact Perfume Zone"
                />
              </div>
              <div className="form-group">
                <label>Boutique Showroom Heading</label>
                <input
                  type="text"
                  value={cms.contact?.showroomName || ''}
                  onChange={(e) => updateContactField('showroomName', e.target.value)}
                  placeholder="London Boutique & Showroom"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Page Header Subtitle / Introduction</label>
              <textarea
                rows={2}
                value={cms.contact?.pageSubtitle || ''}
                onChange={(e) => updateContactField('pageSubtitle', e.target.value)}
                placeholder="Our dedicated fragrance concierge team is here to assist you..."
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Boutique Address (supports multiple lines)</label>
                <textarea
                  rows={4}
                  value={cms.contact?.address || ''}
                  onChange={(e) => updateContactField('address', e.target.value)}
                  placeholder="Perfume Zone UK&#10;48 Mayfair Luxury Lane&#10;London, W1K 2PB&#10;United Kingdom"
                />
              </div>
              <div className="form-group">
                <label>Showroom Hours (supports multiple lines)</label>
                <textarea
                  rows={4}
                  value={cms.contact?.hours || ''}
                  onChange={(e) => updateContactField('hours', e.target.value)}
                  placeholder="Monday – Saturday: 10:00 AM – 7:00 PM&#10;Sunday: 12:00 PM – 6:00 PM"
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Customer Support Email</label>
                <input
                  type="email"
                  value={cms.contact?.email || ''}
                  onChange={(e) => updateContactField('email', e.target.value)}
                  placeholder="support@perfumezone.uk"
                />
              </div>
              <div className="form-group">
                <label>Wholesale &amp; B2B Email</label>
                <input
                  type="email"
                  value={cms.contact?.wholesaleEmail || ''}
                  onChange={(e) => updateContactField('wholesaleEmail', e.target.value)}
                  placeholder="wholesale@perfumezone.uk"
                />
              </div>
              <div className="form-group">
                <label>UK Telephone Helpline</label>
                <input
                  type="text"
                  value={cms.contact?.phone || ''}
                  onChange={(e) => updateContactField('phone', e.target.value)}
                  placeholder="+44 (0) 20 7946 0991"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery &amp; Customer Assurance Promise</label>
              <textarea
                rows={2}
                value={cms.contact?.deliveryAssurance || ''}
                onChange={(e) => updateContactField('deliveryAssurance', e.target.value)}
                placeholder="All UK orders placed before 2:00 PM Monday through Friday are dispatched on the same business day..."
              />
            </div>

            <div className="form-panel-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('contact', 'Contact Us Page')}
              >
                Save Contact Us Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ABOUT US */}
      {activeSubTab === 'about' && (
        <div className="dash-stack">
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Brand Heritage</span>
                <h3>About Us Page Content</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Controls the story, imagery, and core values shown on <code>/pages/about-us</code>.
                </p>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label>Eyebrow Header</label>
                <input
                  type="text"
                  value={cms.about?.eyebrow || ''}
                  onChange={(e) => updateAboutField('eyebrow', e.target.value)}
                  placeholder="OUR HERITAGE & PASSION"
                />
              </div>
              <div className="form-group">
                <label>Page Main Heading</label>
                <input
                  type="text"
                  value={cms.about?.title || ''}
                  onChange={(e) => updateAboutField('title', e.target.value)}
                  placeholder="Welcome to Perfume Zone"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Lead Introduction</label>
              <textarea
                rows={2}
                value={cms.about?.leadText || ''}
                onChange={(e) => updateAboutField('leadText', e.target.value)}
                placeholder="Born from an obsession with rare aromas and rich Arabian heritage..."
              />
            </div>

            <div className="form-group">
              <ImageUploadField
                label="About Us Hero Banner Image (Choose File or URL)"
                value={cms.about?.heroImage || ''}
                onChange={(img) => updateAboutField('heroImage', img)}
                previewHeight={180}
                helpText="Choose brand story header banner from your computer"
              />
            </div>

            <div className="form-group">
              <label>Story Heading</label>
              <input
                type="text"
                value={cms.about?.storyHeading || ''}
                onChange={(e) => updateAboutField('storyHeading', e.target.value)}
                placeholder="The Perfume Zone Story"
              />
            </div>

            <div className="form-group">
              <label>Story Paragraph 1</label>
              <textarea
                rows={3}
                value={cms.about?.storyParagraph1 || ''}
                onChange={(e) => updateAboutField('storyParagraph1', e.target.value)}
                placeholder="At Perfume Zone, we believe that fragrance is not merely an accessory..."
              />
            </div>

            <div className="form-group">
              <label>Story Paragraph 2</label>
              <textarea
                rows={3}
                value={cms.about?.storyParagraph2 || ''}
                onChange={(e) => updateAboutField('storyParagraph2', e.target.value)}
                placeholder="From the deep, resinous allure of Cambodian and Hindi Agarwood..."
              />
            </div>
          </div>

          {/* About Core Values */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Pillars of Excellence</span>
                <h3>Brand Core Values ({(cms.about?.values || []).length})</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Three or four key pillars highlighted in cards on the About Us page.
                </p>
              </div>
              <button type="button" className="btn btn-sm" onClick={addAboutValue}>
                + Add Value
              </button>
            </div>

            <div className="form-row-3" style={{ marginTop: 14 }}>
              {(cms.about?.values || []).map((v, idx) => (
                <div key={v.id || idx} className="cms-badge-edit-box">
                  <div className="cms-badge-top">
                    <CheckIcon />
                    <strong>Pillar #{idx + 1}</strong>
                    <button
                      type="button"
                      className="link-inline-btn danger"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => deleteAboutValue(idx)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label>Title</label>
                    <input
                      type="text"
                      value={v.title || ''}
                      onChange={(e) => updateAboutValue(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={v.desc || ''}
                      onChange={(e) => updateAboutValue(idx, 'desc', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-panel-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('about', 'About Us Page')}
              >
                Save About Us Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: FAQ */}
      {activeSubTab === 'faq' && (
        <div className="dash-stack">
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Customer Guidance</span>
                <h3>FAQ Categories &amp; Questions</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Organize frequently asked questions by category on <code>/pages/faqs</code>.
                </p>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label>Page Title</label>
                <input
                  type="text"
                  value={cms.faq?.pageTitle || ''}
                  onChange={(e) => updateFaqField('pageTitle', e.target.value)}
                  placeholder="Frequently Asked Questions"
                />
              </div>
              <div className="form-group">
                <label>Page Subtitle</label>
                <input
                  type="text"
                  value={cms.faq?.pageSubtitle || ''}
                  onChange={(e) => updateFaqField('pageSubtitle', e.target.value)}
                  placeholder="Find quick answers about delivery, authenticity, payment..."
                />
              </div>
            </div>

            {/* Add Category */}
            <form onSubmit={addFaqCategory} className="cms-add-nav-form" style={{ marginTop: 16 }}>
              <h4>+ Create New FAQ Category</h4>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fragrance Advice & Care or Tracking & Shipping"
                  value={newFaqCat}
                  onChange={(e) => setNewFaqCat(e.target.value)}
                />
                <button type="submit" className="btn btn-sm">Add Category</button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          {(cms.faq?.categories || []).map((cat, catIdx) => (
            <div key={cat.id || catIdx} className="dash-card">
              <div className="dash-card-head">
                <div>
                  <span className="eyebrow">Category #{catIdx + 1}</span>
                  <h3>{cat.name || cat.category || 'Untitled Category'} ({(cat.items || []).length} Q&amp;As)</h3>
                </div>
                <div className="dash-card-actions">
                  <button
                    type="button"
                    className="btn ghost danger-btn btn-sm"
                    onClick={() => deleteFaqCategory(catIdx)}
                  >
                    Delete Category
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => addFaqQuestion(catIdx)}
                  >
                    + Add Question
                  </button>
                </div>
              </div>

              <div className="cms-faq-items-list" style={{ marginTop: 14 }}>
                {(cat.items || []).map((item, itemIdx) => (
                  <div key={item.id || itemIdx} className="cms-item-card" style={{ marginBottom: 12 }}>
                    <div className="cms-item-card-header">
                      <strong>Q{itemIdx + 1}: {item.q}</strong>
                      <button
                        type="button"
                        className="link-inline-btn danger"
                        onClick={() => deleteFaqQuestion(catIdx, itemIdx)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Question *</label>
                      <input
                        type="text"
                        value={item.q || ''}
                        onChange={(e) => updateFaqQuestion(catIdx, itemIdx, 'q', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Detailed Answer *</label>
                      <textarea
                        rows={3}
                        value={item.a || ''}
                        onChange={(e) => updateFaqQuestion(catIdx, itemIdx, 'a', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="dash-card" style={{ padding: '16px 24px' }}>
            <div className="form-panel-footer" style={{ justifyContent: 'flex-end', margin: 0 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('faq', 'FAQ Page')}
              >
                Save All FAQs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: WHOLESALE */}
      {activeSubTab === 'wholesale' && (
        <div className="dash-stack">
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">B2B Trade Application</span>
                <h3>Wholesale Page Information</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Customize headings, intro copy, and contact email on <code>/pages/wholesale</code>.
                </p>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label>Eyebrow Header</label>
                <input
                  type="text"
                  value={cms.wholesale?.eyebrow || ''}
                  onChange={(e) => updateWholesaleField('eyebrow', e.target.value)}
                  placeholder="B2B & TRADE PARTNERSHIPS"
                />
              </div>
              <div className="form-group">
                <label>Page Main Title</label>
                <input
                  type="text"
                  value={cms.wholesale?.title || ''}
                  onChange={(e) => updateWholesaleField('title', e.target.value)}
                  placeholder="Wholesale Perfume Distribution"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Wholesale Introduction / Subtitle</label>
              <textarea
                rows={2}
                value={cms.wholesale?.subtitle || ''}
                onChange={(e) => updateWholesaleField('subtitle', e.target.value)}
                placeholder="Partner with Perfume Zone UK for competitive wholesale pricing..."
              />
            </div>

            <div className="form-group">
              <label>Wholesale Trade Email Address</label>
              <input
                type="email"
                value={cms.wholesale?.contactEmail || ''}
                onChange={(e) => updateWholesaleField('contactEmail', e.target.value)}
                placeholder="wholesale@perfumezone.uk"
              />
            </div>
          </div>

          {/* Wholesale Benefits */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">Distribution Perks</span>
                <h3>Wholesale Partner Benefits ({(cms.wholesale?.benefits || []).length})</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Perks shown in the 3 benefit cards above the trade application form.
                </p>
              </div>
              <button type="button" className="btn btn-sm" onClick={addWholesaleBenefit}>
                + Add Benefit
              </button>
            </div>

            <div className="form-row-3" style={{ marginTop: 14 }}>
              {(cms.wholesale?.benefits || []).map((b, idx) => (
                <div key={b.id || idx} className="cms-badge-edit-box">
                  <div className="cms-badge-top">
                    <ShieldIcon />
                    <strong>Perk #{idx + 1}</strong>
                    <button
                      type="button"
                      className="link-inline-btn danger"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => deleteWholesaleBenefit(idx)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label>Title</label>
                    <input
                      type="text"
                      value={b.title || ''}
                      onChange={(e) => updateWholesaleBenefit(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={b.desc || ''}
                      onChange={(e) => updateWholesaleBenefit(idx, 'desc', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-panel-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                onClick={() => saveSection('wholesale', 'Wholesale Page')}
              >
                Save Wholesale Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
