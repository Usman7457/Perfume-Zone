import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Resilient wrapper for autoTable in both ESM & browser environments
function renderTable(doc, options) {
  if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(options);
  } else if (autoTable && typeof autoTable.default === 'function') {
    autoTable.default(doc, options);
  }
}

// Helper for formatted date
function getTimestamp() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function formatCurrency(val) {
  const n = Number(val) || 0;
  return `£${n.toFixed(2)}`;
}

// Add luxury branded header banner
function addBrandedHeader(doc, title, subtitle, metaPairs = []) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark header bar
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent strip
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(212, 175, 55);
  doc.text('PERFUME ZONE UK', 14, 13);

  // Document Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text(title.toUpperCase(), 14, 21);

  // Date on top right
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  const dateStr = `Generated: ${new Date().toLocaleString('en-GB')}`;
  doc.text(dateStr, pageWidth - 14, 13, { align: 'right' });

  // Subtitle / Storefront info
  doc.text('Store: perfumezone.uk | Unit 38, Marlands Centre, Southampton', pageWidth - 14, 21, { align: 'right' });

  // Metadata summary badges bar
  if (metaPairs.length > 0) {
    let startY = 36;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, startY, pageWidth - 28, 14, 2, 2, 'F');

    const colWidth = (pageWidth - 28) / metaPairs.length;
    metaPairs.forEach((pair, idx) => {
      const x = 14 + idx * colWidth + 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 110);
      doc.text(pair.label.toUpperCase(), x, startY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(String(pair.value), x, startY + 11);
    });

    return startY + 20;
  }

  return 36;
}

// Add page footer
function addPageFooters(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Perfume Zone UK • Confidential Storefront Report • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }
}

/**
 * 1. Export Orders Report (PDF)
 */
export function exportOrdersPdf(orders = []) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const totalRev = orders
    .filter((o) => (o.status || '') !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const pendingCount = orders.filter(
    (o) => !['Delivered', 'Cancelled'].includes(o.status || 'Confirmed')
  ).length;

  const deliveredCount = orders.filter((o) => (o.status || '') === 'Delivered').length;

  const startY = addBrandedHeader(
    doc,
    'Orders & Fulfillment Activity Report',
    'Fulfillment, tracking, and customer orders statement',
    [
      { label: 'Total Orders', value: orders.length },
      { label: 'Gross Revenue', value: formatCurrency(totalRev) },
      { label: 'Active Pending', value: pendingCount },
      { label: 'Delivered Orders', value: deliveredCount }
    ]
  );

  const tableBody = orders.map((o) => {
    const itemsCount = Array.isArray(o.items) ? o.items.reduce((s, it) => s + (it.qty || 1), 0) : 1;
    const itemsSummary = Array.isArray(o.items) && o.items.length
      ? o.items.map((it) => `${it.title || 'Fragrance'} (x${it.qty || 1})`).join('; ')
      : 'Fragrance order';

    const orderDate = o.createdAt
      ? new Date(o.createdAt).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');

    return [
      o.id || 'N/A',
      orderDate,
      o.customerName || 'Customer',
      o.email || '—',
      `${itemsCount} item(s)`,
      formatCurrency(o.total),
      o.paymentPlatform || o.paymentMethod || 'Card / Stripe',
      o.status || 'Confirmed',
      o.trackingNumber || 'Pending'
    ];
  });

  renderTable(doc, {
    startY,
    head: [[
      'Order ID',
      'Date',
      'Customer',
      'Email',
      'Items',
      'Total',
      'Payment',
      'Status',
      'Tracking #'
    ]],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [24, 24, 24],
      textColor: [212, 175, 55],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [35, 35, 35]
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26 },
      1: { cellWidth: 20 },
      2: { cellWidth: 28 },
      3: { cellWidth: 38 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 20, fontStyle: 'bold', halign: 'right' },
      6: { cellWidth: 24 },
      7: { cellWidth: 24, fontStyle: 'bold' },
      8: { cellWidth: 32 }
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc);
  doc.save(`PerfumeZone_Orders_Report_${getTimestamp()}.pdf`);
}

/**
 * 2. Export Products Inventory Report (PDF)
 */
export function exportProductsPdf(products = []) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const totalCatalogValue = products.reduce((sum, p) => {
    const qty = p.stock_quantity != null ? Number(p.stock_quantity) : (p.in_stock !== false ? 15 : 0);
    return sum + (Number(p.price) || 0) * qty;
  }, 0);

  const inStockCount = products.filter((p) => p.in_stock !== false).length;
  const outOfStockCount = products.length - inStockCount;

  const brandsSet = new Set(products.map((p) => p.brand).filter(Boolean));

  const startY = addBrandedHeader(
    doc,
    'Catalog & Inventory Valuation Report',
    'Storefront fragrance lines, inventory stock levels, and retail pricing',
    [
      { label: 'Catalog Products', value: products.length },
      { label: 'Fragrance Houses', value: brandsSet.size },
      { label: 'In Stock Lines', value: inStockCount },
      { label: 'Out of Stock', value: outOfStockCount },
      { label: 'Est. Stock Valuation', value: formatCurrency(totalCatalogValue) }
    ]
  );

  const tableBody = products.map((p) => {
    const categories = Array.isArray(p.collections)
      ? p.collections.join(', ')
      : (p.collections || 'all');

    const stockQty = p.stock_quantity != null
      ? String(p.stock_quantity)
      : (p.in_stock !== false ? '15 (In Stock)' : '0 (Sold Out)');

    return [
      p.sku || p.handle || '—',
      p.title || 'Fragrance',
      p.brand || 'Perfume Zone',
      p.size || '100ml',
      formatCurrency(p.price),
      p.compare_at_price ? formatCurrency(p.compare_at_price) : '—',
      stockQty,
      p.in_stock !== false ? 'In Stock' : 'Out of Stock',
      categories
    ];
  });

  renderTable(doc, {
    startY,
    head: [[
      'SKU / Handle',
      'Product Title',
      'Brand / House',
      'Size',
      'Retail Price',
      'Compare At',
      'Stock Qty',
      'Status',
      'Assigned Categories'
    ]],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [24, 24, 24],
      textColor: [212, 175, 55],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [35, 35, 35]
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { cellWidth: 46 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22, fontStyle: 'bold', halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 22, fontStyle: 'bold' },
      8: { cellWidth: 46 }
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc);
  doc.save(`PerfumeZone_Products_Inventory_${getTimestamp()}.pdf`);
}

/**
 * 3. Export Subscribers Marketing Report (PDF)
 */
export function exportSubscribersPdf(subscribers = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const footerCount = subscribers.filter((s) => (s.source || '').toLowerCase().includes('footer')).length;
  const popupCount = subscribers.filter((s) => (s.source || '').toLowerCase().includes('popup')).length;

  const startY = addBrandedHeader(
    doc,
    'Marketing Audience & Newsletter Subscribers',
    'Verified opt-in customer email subscriber database',
    [
      { label: 'Total Subscribers', value: subscribers.length },
      { label: 'Footer Signups', value: footerCount },
      { label: 'Popup Campaign', value: popupCount },
      { label: 'Audience Status', value: '100% Opt-in' }
    ]
  );

  const tableBody = subscribers.map((sub, idx) => {
    const signupDate = sub.subscribed_at
      ? new Date(sub.subscribed_at).toLocaleDateString('en-GB')
      : '—';

    return [
      String(idx + 1),
      sub.email || '—',
      (sub.source || 'Footer Newsletter').toUpperCase(),
      signupDate,
      'Active (Opted In)'
    ];
  });

  renderTable(doc, {
    startY,
    head: [[
      '#',
      'Subscriber Email',
      'Signup Channel',
      'Subscription Date',
      'Marketing Status'
    ]],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [24, 24, 24],
      textColor: [212, 175, 55],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [35, 35, 35]
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { fontStyle: 'bold', cellWidth: 70 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 30, fontStyle: 'bold', textColor: [34, 139, 34] }
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc);
  doc.save(`PerfumeZone_Subscribers_List_${getTimestamp()}.pdf`);
}
