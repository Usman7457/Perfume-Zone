import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveImportedProducts, getCustomProducts, clearCustomProducts, money } from '../api.js';
import { UploadIcon, CheckIcon, TrashIcon } from '../components/Icons.jsx';

export default function ImportProducts() {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);
  const [existingCount, setExistingCount] = useState(() => getCustomProducts().length);

  // Helper to slugify handle
  const slugify = (text = '') =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleFileUpload = (e) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    processFile(uploaded);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const processFile = (f) => {
    setError('');
    setSuccess('');
    setFile(f);
    setLoading(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!data || data.length === 0) {
          setError('No data rows found in the uploaded spreadsheet.');
          setLoading(false);
          return;
        }

        // Map columns flexibly
        const normalized = data.map((row, idx) => {
          const keys = Object.keys(row);
          const findVal = (...fieldNames) => {
            const foundKey = keys.find((k) =>
              fieldNames.some((fn) => k.toLowerCase().replace(/[\s_-]/g, '') === fn.toLowerCase().replace(/[\s_-]/g, ''))
            );
            return foundKey ? row[foundKey] : '';
          };

          const title = findVal('title', 'producttitle', 'name', 'productname', 'item') || `Perfume Product ${idx + 1}`;
          let handle = findVal('handle', 'slug', 'sku', 'producthandle');
          if (!handle) handle = slugify(title) || `perfume-${idx + 1}`;

          const brand = findVal('brand', 'vendor', 'designer', 'maker') || 'Perfume Zone';
          const priceRaw = findVal('price', 'cost', 'unitprice', 'saleprice') || 0;
          const price = parseFloat(String(priceRaw).replace(/[^0-9.]/g, '')) || 0;

          const compareRaw = findVal('compare_at_price', 'compareatprice', 'regularprice', 'retailprice', 'msrp', 'rrp');
          const compare_at_price = compareRaw ? parseFloat(String(compareRaw).replace(/[^0-9.]/g, '')) : null;

          const image_url = findVal('image_url', 'image', 'imageurl', 'img', 'photo', 'src', 'mainimage');
          const image_url_2 = findVal('image_url_2', 'image2', 'secondaryimage', 'alternateimage');
          const description = findVal('description', 'desc', 'details', 'notes', 'body') || 'Luxurious fragrance crafted for lasting elegance.';
          const size = findVal('size', 'volume', 'bottle', 'variant') || '100ml Eau De Parfum';
          const collections = findVal('collections', 'category', 'categories', 'collection', 'tags') || 'new-in|all';

          return {
            id: Date.now() + idx,
            handle,
            title,
            brand,
            price,
            compare_at_price,
            image_url: image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
            image_url_2: image_url_2 || null,
            description,
            size,
            collections,
            in_stock: 1
          };
        });

        setParsedRows(normalized);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to parse spreadsheet. Please ensure it is a valid .xlsx, .xls, or .csv file.');
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Could not read the file.');
      setLoading(false);
    };

    reader.readAsBinaryString(f);
  };

  const handleSaveToStore = () => {
    if (!parsedRows.length) return;
    const res = saveImportedProducts(parsedRows, replaceMode);
    setSuccess(`Successfully imported ${parsedRows.length} products to Perfume Zone!`);
    setExistingCount(res.length);
  };

  const handleClearCustom = () => {
    if (window.confirm('Reset custom imported products and revert to default catalog?')) {
      clearCustomProducts();
      setExistingCount(0);
      setSuccess('Custom products cleared. Reverted to standard catalog.');
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        Handle: 'lattafa-khamrah-qahwa',
        Title: 'Lattafa Khamrah Qahwa Edition',
        Brand: 'Lattafa',
        Price: 48.00,
        Compare_At_Price: 60.00,
        Size: '100ml Eau De Parfum',
        Collections: 'new-in|best-sellers|lattafa|gourmand|unisex',
        Image_URL: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
        Image_URL_2: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        Description: 'An intoxicating blend of cardamom, roasted Arabica coffee, ginger, sweet candied pralines, and benzoin.'
      },
      {
        Handle: 'oud-maracuja-maison-crivelli',
        Title: 'Oud Maracuja Extrait',
        Brand: 'Blends of Dubai',
        Price: 79.00,
        Compare_At_Price: 95.00,
        Size: '100ml Extrait De Parfum',
        Collections: 'new-in|oud-1|extrait-de-parfum|fruity-1',
        Image_URL: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        Image_URL_2: '',
        Description: 'Vibrant passion fruit accords fused with deep, resinous smoky oud and Indonesian patchouli.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'perfumezone_products_template.xlsx');
  };

  return (
    <div className="container import-page">
      <header className="import-header">
        <h1>Import Products from Excel / CSV</h1>
        <p className="muted">
          Easily upload your product inventory spreadsheet into <strong>perfumezone.uk</strong>. Supports <code>.xlsx</code>, <code>.xls</code>, and <code>.csv</code> files.
        </p>
      </header>

      {/* Action / Help banner */}
      <div className="import-actions-bar">
        <button
          type="button"
          className="btn ghost download-template-btn"
          onClick={downloadSampleTemplate}
        >
          ⬇ Download Sample Excel Template (.xlsx)
        </button>

        {existingCount > 0 && (
          <button
            type="button"
            className="btn ghost clear-products-btn"
            onClick={handleClearCustom}
          >
            <TrashIcon /> Reset Custom Products ({existingCount})
          </button>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className="upload-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon">
          <UploadIcon />
        </div>
        <h3>Select or Drag & Drop your Excel file here</h3>
        <p className="muted">
          Supported formats: Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
        </p>
        <label className="btn upload-file-label">
          Browse File
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </label>
        {file && <div className="selected-file-info">Selected file: <strong>{file.name}</strong></div>}
      </div>

      {loading && <p className="import-loading-text">Parsing spreadsheet rows...</p>}
      {error && <div className="import-error-banner">{error}</div>}
      {success && (
        <div className="import-success-banner">
          <CheckIcon />
          <div>
            <strong>{success}</strong>
            <div className="import-success-links">
              <Link to="/collections/all" className="link">View All Products in Store →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedRows.length > 0 && (
        <div className="import-preview-section">
          <div className="preview-header-row">
            <div>
              <h2>Products Preview ({parsedRows.length} items found)</h2>
              <p className="muted">Review the detected columns and values below before importing into the store.</p>
            </div>

            <div className="import-controls">
              <label className="replace-toggle-label">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                />
                <span>Replace all previous custom products</span>
              </label>

              <button
                type="button"
                className="btn primary-import-btn"
                onClick={handleSaveToStore}
              >
                Save &amp; Import {parsedRows.length} Products to Website
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="import-preview-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Compare At</th>
                  <th>Size</th>
                  <th>Collections</th>
                  <th>Handle</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 50).map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="table-thumb">
                        {r.image_url ? <img src={r.image_url} alt="" /> : <div className="ph" />}
                      </div>
                    </td>
                    <td><strong>{r.title}</strong></td>
                    <td>{r.brand}</td>
                    <td><strong>{money(r.price)}</strong></td>
                    <td>{r.compare_at_price ? money(r.compare_at_price) : '—'}</td>
                    <td>{r.size}</td>
                    <td>
                      <span className="collection-tags">
                        {r.collections.split('|').map((c) => (
                          <span key={c} className="col-pill">{c}</span>
                        ))}
                      </span>
                    </td>
                    <td><code>{r.handle}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 50 && (
            <p className="muted preview-cutoff">Showing first 50 of {parsedRows.length} products.</p>
          )}
        </div>
      )}

      {/* Supported Columns Guide */}
      <section className="import-guide-section">
        <h3>Spreadsheet Column Headers Guide</h3>
        <p className="muted">The importer intelligently matches these columns from your Excel file:</p>
        <div className="columns-grid">
          <div className="col-guide-card">
            <strong>Title / Name</strong>
            <span>Product name (e.g., Lattafa Khamrah)</span>
          </div>
          <div className="col-guide-card">
            <strong>Brand / Vendor</strong>
            <span>Brand name (e.g., Afnan, Ajmal, Swiss Arabian)</span>
          </div>
          <div className="col-guide-card">
            <strong>Price / Cost</strong>
            <span>Numeric selling price in GBP £ (e.g., 45.00)</span>
          </div>
          <div className="col-guide-card">
            <strong>Compare_At_Price</strong>
            <span>Original/RRP price for sale discount calculation</span>
          </div>
          <div className="col-guide-card">
            <strong>Image_URL</strong>
            <span>Direct image link or web URL for the bottle</span>
          </div>
          <div className="col-guide-card">
            <strong>Size</strong>
            <span>Bottle size / concentration (e.g., 100ml EDP)</span>
          </div>
          <div className="col-guide-card">
            <strong>Collections</strong>
            <span>Pipe-separated collection handles (e.g. new-in|best-sellers|mens)</span>
          </div>
          <div className="col-guide-card">
            <strong>Description</strong>
            <span>Fragrance story, notes, and sillage description</span>
          </div>
        </div>
      </section>
    </div>
  );
}
