import { useParams, Link } from 'react-router-dom';

const STATIC_CONTENT = {
  'terms-of-service': {
    title: 'Terms & Conditions',
    subtitle: 'Perfume Zone UK (perfumezone.uk)',
    body: (
      <>
        <p><strong>Last Updated: January 2026</strong></p>
        <p>Welcome to <strong>Perfume Zone</strong> (operated at <strong>https://perfumezone.uk</strong>). By accessing our website, placing an order, or browsing our fragrance collections, you agree to comply with and be bound by the following terms and conditions.</p>
        
        <h3>1. Ordering and Authenticity</h3>
        <p>All orders placed through <strong>perfumezone.uk</strong> represent an offer to purchase the specified fragrance products. We warrant that all perfumes, oils, and attars distributed through Perfume Zone are 100% authentic, sealed in original factory packaging, and sourced through lawful brand channels.</p>
        
        <h3>2. Pricing &amp; Currency</h3>
        <p>All prices displayed on the website are in Pounds Sterling (GBP £) and inclusive of applicable UK VAT unless specified otherwise. We reserve the right to correct any typographical or system pricing errors prior to dispatch.</p>
        
        <h3>3. Delivery &amp; Title</h3>
        <p>Risk of loss and title for items purchased pass to you upon delivery by the carrier (Royal Mail, DPD, or DHL). Please ensure your delivery address is accurate and safe for receiving parcel delivery.</p>

        <h3>4. Customer Conduct &amp; Intellectual Property</h3>
        <p>All content, including bottle photography, logos, branding, descriptions, and site code, is the property of Perfume Zone or its respective brand licensors and is protected by UK intellectual property law.</p>

        <h3>5. Contact</h3>
        <p>For questions regarding our terms, please email our legal team at <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a>.</p>
      </>
    )
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'Your Data Protection at perfumezone.uk',
    body: (
      <>
        <p><strong>Effective Date: January 2026</strong></p>
        <p>At <strong>Perfume Zone</strong> (<a href="https://perfumezone.uk">perfumezone.uk</a>), we respect your personal privacy and comply strictly with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.</p>

        <h3>Information We Collect</h3>
        <ul>
          <li><strong>Contact Details:</strong> Your name, delivery address, email, and telephone number when placing an order or registering an account.</li>
          <li><strong>Transaction Information:</strong> Details necessary to fulfill your order. Note: We never store complete credit or debit card numbers on our servers; payments are processed securely through certified PCI-DSS Level 1 compliant processors.</li>
          <li><strong>Browsing Data:</strong> Anonymized cookies and device logs to ensure smooth checkout performance and optimize site navigation.</li>
        </ul>

        <h3>How We Use Your Data</h3>
        <p>Your data is used strictly for processing your order, providing Royal Mail delivery notifications, providing concierge customer support, and (with your explicit opt-in) sending curated perfume releases and discounts.</p>

        <h3>Your Rights</h3>
        <p>You have the right to access, rectify, or request deletion of your personal data at any time. Simply email <a href="mailto:privacy@perfumezone.uk">privacy@perfumezone.uk</a> or <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a>.</p>
      </>
    )
  },
  'refund-policy': {
    title: 'Return & Refund Policy',
    subtitle: 'Transparent & Fair Returns at Perfume Zone',
    body: (
      <>
        <p>We want you to be completely delighted with your fragrance purchase from <strong>perfumezone.uk</strong>.</p>

        <h3>14-Day Return Guarantee</h3>
        <p>You may return any unopened, unused fragrance item within 14 days of delivery for a full refund or exchange.</p>

        <h3>Hygiene &amp; Cosmetic Safety Requirements</h3>
        <p>Due to health, cosmetic safety, and hygiene regulations, any fragrance where the outer cellophane seal has been broken or the bottle has been sprayed cannot be accepted for return. Please ensure you are certain of your scent selection before opening sealed packaging.</p>

        <h3>Damaged or Defective Items</h3>
        <p>In the unlikely event that your bottle arrives leaking, damaged, or broken in transit, please notify us within 48 hours of receipt at <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a> with clear photographs. We will immediately dispatch a replacement or issue a full refund including original delivery charges.</p>

        <h3>Return Shipping Process</h3>
        <p>To initiate a return, contact <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a> with your Order ID (#PZ-XXXXXX). Our team will provide an approved UK return shipping address and return authorization number.</p>
      </>
    )
  },
  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Prompt, Secure UK Dispatch from perfumezone.uk',
    body: (
      <>
        <p>All orders from <strong>Perfume Zone</strong> are dispatched from our central London fulfillment center using secure tracked courier services.</p>

        <h3>United Kingdom Delivery Options</h3>
        <ul>
          <li><strong>Royal Mail Tracked 48 (Standard):</strong> £3.99 — Delivered in 2 to 3 business days. <span className="free-tag">FREE on orders over £50</span>.</li>
          <li><strong>Royal Mail Tracked 24 (Express Next Day):</strong> £5.99 — Delivered next business day on orders placed before 2:00 PM.</li>
          <li><strong>Guaranteed Saturday Delivery:</strong> £9.99 — For urgent weekend delivery across mainland UK.</li>
        </ul>

        <h3>Dispatch Schedule</h3>
        <p>Orders received before 2:00 PM GMT Monday to Friday are processed and dispatched on the same business day. Orders placed over the weekend or on UK bank holidays are dispatched on the next working business day.</p>

        <h3>Order Tracking</h3>
        <p>Every dispatch includes a tracking number sent via email and SMS. You can track your parcel at any time via Royal Mail tracking.</p>

        <h3>European &amp; International Delivery</h3>
        <p>We deliver to European countries (France, Germany, Spain, Netherlands, Ireland, Poland) with transit times averaging 4 to 7 business days.</p>
      </>
    )
  },
  'our-partners': {
    title: 'Our Partners & Perfume Houses',
    subtitle: 'Direct Collaborations with Prestigious Arabian & Global Houses',
    body: (
      <>
        <p>At <strong>Perfume Zone</strong> (<a href="https://perfumezone.uk">perfumezone.uk</a>), we take immense pride in our direct partnerships with the most renowned master perfumers and historic fragrance creators across Dubai, the United Arab Emirates, France, and Switzerland.</p>
        <p>Our authorized brand portfolio includes:</p>
        <ul>
          <li><strong>Afnan Perfumes:</strong> Masters of contemporary luxury and unforgettable sillage.</li>
          <li><strong>Swiss Arabian:</strong> Heritage perfumery dating back to 1974, harmonizing East and West.</li>
          <li><strong>Lattafa Perfumes:</strong> Trendsetting creators of viral oriental sensations like Khamrah.</li>
          <li><strong>Oud Elixir:</strong> Royal bespoke extraits formulated with pure aged agarwood oils.</li>
          <li><strong>Ajmal Perfumes:</strong> 70 years of legendary oud mastery and royal craftsmanship.</li>
          <li><strong>Rasasi Perfumes:</strong> Iconic fragrance house celebrated worldwide for Hawas and La Yuqawam.</li>
        </ul>
        <p>Every partnership is governed by strict authenticity protocols, ensuring our UK clientele receives fresh, unadulterated stock direct from manufacture.</p>
      </>
    )
  },
  'our-creations': {
    title: 'Our Creations & Blends',
    subtitle: 'Artisanal Perfumery at Perfume Zone',
    body: (
      <>
        <p>In addition to curating iconic creations from top Arabian houses, <strong>Perfume Zone</strong> partners with master noses to develop exclusive private blends available only at <strong>perfumezone.uk</strong>.</p>
        <p>Each blend is created using high proportions of natural botanical extracts, rare resins, pure vanilla beans, and sustainably sourced woods. Our focus on <em>Extrait De Parfum</em> concentrations delivers unrivaled longevity on skin and fabric.</p>
        <p>Experience our signature creation, <Link to="/products/oud-elixir-dubai-oud-intense" className="link">Oud Elixir Dubai Oud Intense</Link>, formulated with Cambodian agarwood, Bulgarian rose, and smoked amber.</p>
      </>
    )
  },
  'the-art-of-gifting': {
    title: 'The Art of Fragrance Gifting',
    subtitle: 'Luxury Presentation by Perfume Zone',
    body: (
      <>
        <p>Giving fragrance is one of the most intimate, thoughtful, and memorable gifts imaginable. At <strong>Perfume Zone</strong> (<a href="https://perfumezone.uk">perfumezone.uk</a>), we treat every gift with the highest degree of elegance.</p>
        <h3>Signature Presentation</h3>
        <p>Every fragrance order can be accompanied by our complimentary gift packaging, including our embossed matte black gift box, satin ribbon, and a bespoke handwritten message card.</p>
        <h3>Complimentary Scent Advice</h3>
        <p>Not sure which scent suits your recipient? Contact our fragrance advisors at <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a> with your recipient's taste and style, and we will recommend three exquisite matches.</p>
      </>
    )
  }
};

const titleize = (s = '') => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function StaticPage({ kind }) {
  const { slug } = useParams();

  if (kind === '404' || !slug) {
    return (
      <div className="container center page-404">
        <span className="eyebrow">ERROR 404</span>
        <h1>Page Not Found</h1>
        <p className="muted max-prose">
          The fragrance page or link you are seeking is unavailable or may have moved to a new home at <strong>perfumezone.uk</strong>.
        </p>
        <div className="error-404-actions">
          <Link className="btn" to="/">Return to Homepage</Link>
          <Link className="btn ghost" to="/collections/all">Browse All Fragrances</Link>
        </div>
      </div>
    );
  }

  const custom = STATIC_CONTENT[slug];

  return (
    <div className="container narrow prose static-page">
      <header className="static-page-header">
        <h1>{custom ? custom.title : titleize(slug)}</h1>
        {custom?.subtitle && <p className="static-page-subtitle muted">{custom.subtitle}</p>}
      </header>

      <div className="static-page-body">
        {custom ? (
          custom.body
        ) : (
          <>
            <p>
              Welcome to <strong>Perfume Zone</strong> (<a href="https://perfumezone.uk">perfumezone.uk</a>). Information for <strong>{titleize(slug)}</strong> is being updated.
            </p>
            <p>
              For immediate assistance or questions regarding this page, please contact our London concierge team at{' '}
              <a href="mailto:support@perfumezone.uk">support@perfumezone.uk</a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
