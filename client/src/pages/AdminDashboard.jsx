import { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import {
  money,
  getAllLocalProducts,
  saveProductAdmin,
  deleteProductAdmin,
  clearCustomProducts,
  getAllOrdersAdmin,
  fetchAllOrdersAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
  getBlogs,
  saveBlogAdmin,
  deleteBlogAdmin,
  resetBlogsAdmin,
  getSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  getSubscribersAdmin,
  deleteSubscriberAdmin
} from '../api.js';
import { ShieldIcon, TruckIcon, UserIcon, CheckIcon, BagIcon, HeartIcon } from '../components/Icons.jsx';

const EMPTY_PRODUCT_FORM = {
  handle: '',
  title: '',
  brand: '',
  price: '',
  compare_at_price: '',
  size: '100ml Eau de Parfum',
  collectionsText: 'all, new-in',
  image_url: '',
  image_url_2: '',
  description: '',
  topNotes: '',
  middleNotes: '',
  baseNotes: '',
  in_stock: true
};

const EMPTY_BLOG_FORM = {
  id: '',
  title: '',
  category: 'Buying Guide',
  date: '',
  readTime: '4 min read',
  img: '',
  excerpt: '',
  content: '',
  published: true
};

const EMPTY_USER_FORM = {
  id: '',
  name: '',
  email: '',
  password: '',
  role: 'customer',
  phone: '',
  address: '',
  city: '',
  postcode: ''
};

const ORDER_STATUSES = [
  'Confirmed',
  'Quality Check',
  'Dispatched',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

function getStatusClass(status) {
  const s = (status || 'Confirmed').toLowerCase();
  if (s.includes('deliver') && !s.includes('out')) return 'delivered';
  if (s.includes('dispatch') || s.includes('ship') || s.includes('out')) return 'dispatched';
  if (s.includes('quality') || s.includes('pack') || s.includes('process')) return 'processing';
  if (s.includes('cancel')) return 'cancelled';
  return 'confirmed';
}

export default function AdminDashboard() {
  const { tab: paramTab } = useParams();
  const activeTab = paramTab || 'overview';
  const nav = useNavigate();

  const { user, isAdmin, logout, allUsers, saveUserAdmin, deleteUserAdmin } = useAuth();

  // Global admin data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [settings, setSettings] = useState(getSiteSettings());
  const [subscribers, setSubscribers] = useState([]);
  const [toast, setToast] = useState('');

  // Products tab states
  const [prodQuery, setProdQuery] = useState('');
  const [prodBrand, setProdBrand] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState(EMPTY_PRODUCT_FORM);

  // Orders tab states
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderEditForm, setOrderEditForm] = useState({
    status: 'Confirmed',
    trackingNumber: '',
    courier: 'Royal Mail Tracked 24',
    adminNote: ''
  });

  // Blogs tab states
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG_FORM);

  // Content tab states
  const [announcementsText, setAnnouncementsText] = useState('');
  const [contentForm, setContentForm] = useState({
    promoCode: '',
    promoTitle: '',
    promoDescription: '',
    offersHeadline: '',
    offersSubheadline: ''
  });

  // Users tab states
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const refreshAll = async () => {
    setProducts(getAllLocalProducts());
    setOrders(getAllOrdersAdmin());
    const syncedOrders = await fetchAllOrdersAdmin();
    if (Array.isArray(syncedOrders)) setOrders(syncedOrders);
    setBlogs(getBlogs(true));
    const s = getSiteSettings();
    setSettings(s);
    setAnnouncementsText((s.announcements || []).join('\n'));
    setContentForm({
      promoCode: s.promoCode || '',
      promoTitle: s.promoTitle || '',
      promoDescription: s.promoDescription || '',
      offersHeadline: s.offersHeadline || '',
      offersSubheadline: s.offersSubheadline || ''
    });
    const subs = await getSubscribersAdmin();
    setSubscribers(Array.isArray(subs) ? subs : []);
  };

  useEffect(() => {
    refreshAll();
    const onChange = () => refreshAll();
    window.addEventListener('pz:products-change', onChange);
    window.addEventListener('pz:orders-change', onChange);
    window.addEventListener('pz:blogs-change', onChange);
    window.addEventListener('pz:settings-change', onChange);
    return () => {
      window.removeEventListener('pz:products-change', onChange);
      window.removeEventListener('pz:orders-change', onChange);
      window.removeEventListener('pz:blogs-change', onChange);
      window.removeEventListener('pz:settings-change', onChange);
    };
  }, []);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = prodQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (prodBrand !== 'all' && p.brand !== prodBrand) return false;
      if (!q) return true;
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.handle || '').toLowerCase().includes(q)
      );
    });
  }, [products, prodQuery, prodBrand]);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && (o.status || 'Confirmed') !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.email || '').toLowerCase().includes(q)
      );
    });
  }, [orders, orderQuery, orderStatusFilter]);

  if (!user || !isAdmin) {
    return (
      <div className="container account-page-container" style={{ maxWidth: 640 }}>
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <span className="eyebrow">Restricted Workspace</span>
          <h1 style={{ marginBottom: 10 }}>Admin Access Required</h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            {user
              ? `Signed in as ${user.email} (${user.role}). Only administrator accounts can manage products, orders, blogs, and storefront content.`
              : 'Please sign in with an administrator account to open the Perfume Zone Admin Dashboard.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/account?redirect=/admin" className="btn">
              {user ? 'Switch to Admin Account' : 'Sign In as Admin'}
            </Link>
            <Link to="/" className="btn ghost">Back to Storefront</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Handlers: Products ---
  const openNewProduct = () => {
    setEditingProduct('new');
    setProdForm(EMPTY_PRODUCT_FORM);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p.handle);
    setProdForm({
      handle: p.handle || '',
      title: p.title || '',
      brand: p.brand || '',
      price: String(p.price ?? ''),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      size: p.size || '100ml Eau de Parfum',
      collectionsText: Array.isArray(p.collections) ? p.collections.join(', ') : '',
      image_url: p.image_url || '',
      image_url_2: p.image_url_2 || '',
      description: p.description || '',
      topNotes: Array.isArray(p.notes?.top) ? p.notes.top.join(', ') : '',
      middleNotes: Array.isArray(p.notes?.middle) ? p.notes.middle.join(', ') : '',
      baseNotes: Array.isArray(p.notes?.base) ? p.notes.base.join(', ') : '',
      in_stock: p.in_stock !== false
    });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.title.trim() || !prodForm.price) return;
    const collections = prodForm.collectionsText
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const parseNotes = (txt) =>
      txt
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    saveProductAdmin({
      handle: editingProduct !== 'new' ? editingProduct : prodForm.handle.trim(),
      title: prodForm.title.trim(),
      brand: prodForm.brand.trim() || 'Perfume Zone',
      price: parseFloat(prodForm.price) || 0,
      compare_at_price: prodForm.compare_at_price ? parseFloat(prodForm.compare_at_price) : null,
      size: prodForm.size.trim() || '100ml',
      collections: collections.length ? collections : ['all'],
      image_url: prodForm.image_url.trim() || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
      image_url_2: prodForm.image_url_2.trim() || '',
      description: prodForm.description.trim(),
      notes: {
        top: parseNotes(prodForm.topNotes),
        middle: parseNotes(prodForm.middleNotes),
        base: parseNotes(prodForm.baseNotes)
      },
      in_stock: Boolean(prodForm.in_stock)
    });
    setEditingProduct(null);
    refreshAll();
    notify('Product saved and synced across the storefront.');
  };

  const handleDeleteProduct = (handle, title) => {
    if (!window.confirm(`Remove "${title}" from the storefront catalog?`)) return;
    deleteProductAdmin(handle);
    refreshAll();
    notify(`Deleted "${title}".`);
  };

  // --- Handlers: Orders ---
  const openManageOrder = (ord) => {
    setSelectedOrder(ord);
    setOrderEditForm({
      status: ord.status || 'Confirmed',
      trackingNumber: ord.trackingNumber || '',
      courier: ord.courier || 'Royal Mail Tracked 24',
      adminNote: ord.adminNote || ''
    });
  };

  const handleSaveOrder = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const updated = updateOrderAdmin(selectedOrder.id, orderEditForm);
    setSelectedOrder(updated);
    refreshAll();
    notify(`Order ${selectedOrder.id} updated to "${orderEditForm.status}".`);
  };

  const handleDeleteOrder = (orderId) => {
    if (!window.confirm(`Delete order ${orderId}?`)) return;
    deleteOrderAdmin(orderId);
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
    refreshAll();
    notify(`Order ${orderId} deleted.`);
  };

  // --- Handlers: Blogs ---
  const openNewBlog = () => {
    setEditingBlog('new');
    setBlogForm({
      ...EMPTY_BLOG_FORM,
      date: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    });
  };

  const openEditBlog = (post) => {
    setEditingBlog(post.id);
    setBlogForm({
      id: post.id,
      title: post.title || '',
      category: post.category || 'Editorial',
      date: post.date || '',
      readTime: post.readTime || '4 min read',
      img: post.img || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      published: post.published !== false
    });
  };

  const handleSaveBlog = (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return;
    saveBlogAdmin({
      ...blogForm,
      id: editingBlog !== 'new' ? editingBlog : undefined,
      img:
        blogForm.img.trim() ||
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
    });
    setEditingBlog(null);
    refreshAll();
    notify('Blog article saved and synced to Fragrance Insights.');
  };

  const handleDeleteBlog = (id, title) => {
    if (!window.confirm(`Delete blog post "${title}"?`)) return;
    deleteBlogAdmin(id);
    refreshAll();
    notify(`Deleted blog "${title}".`);
  };

  // --- Handlers: Site Content ---
  const handleSaveContent = (e) => {
    e.preventDefault();
    const announcements = announcementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    saveSiteSettings({
      announcements: announcements.length ? announcements : settings.announcements,
      ...contentForm
    });
    refreshAll();
    notify('Storefront announcements, promo codes & offers updated live.');
  };

  // --- Handlers: Users ---
  const openNewUser = () => {
    setEditingUser('new');
    setUserForm(EMPTY_USER_FORM);
  };

  const openEditUser = (u) => {
    setEditingUser(u.email);
    setUserForm({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'customer',
      phone: u.phone || '',
      address: u.address || '',
      city: u.city || '',
      postcode: u.postcode || ''
    });
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const res = saveUserAdmin(userForm);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    setEditingUser(null);
    notify(`User account "${userForm.email}" saved.`);
  };

  const totalRevenue = orders
    .filter((o) => (o.status || '') !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const pendingOrdersCount = orders.filter(
    (o) => !['Delivered', 'Cancelled'].includes(o.status || 'Confirmed')
  ).length;

  const publishedBlogsCount = blogs.filter((b) => b.published !== false).length;

  return (
    <div className="dashboard-shell">
      <div className="container account-page-container">
        {toast && (
          <div className="admin-toast" role="status">
            <CheckIcon /> <span>{toast}</span>
          </div>
        )}

        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dash-sidebar admin-sidebar">
            <div className="dash-user-card">
              <div className="dash-avatar admin-avatar">
                {(user.name || 'A').slice(0, 1).toUpperCase()}
              </div>
              <div className="dash-user-meta">
                <strong>{user.name}</strong>
                <span className="muted small dash-email-truncate">{user.email}</span>
                <span className="role-pill admin">Administrator</span>
              </div>
            </div>

            <div className="dash-nav-groups">
              <div className="dash-nav-group">
                <span className="dash-nav-heading">Overview</span>
                <nav className="dash-nav">
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      'dash-nav-link' + (isActive && activeTab === 'overview' ? ' active' : '')
                    }
                  >
                    <ShieldIcon /> <span>Dashboard Home</span>
                  </NavLink>
                </nav>
              </div>

              <div className="dash-nav-group">
                <span className="dash-nav-heading">Catalog &amp; Fulfillment</span>
                <nav className="dash-nav">
                  <NavLink to="/admin/products" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <BagIcon />
                    <span>Products</span>
                    <span className="dash-count-pill">{products.length}</span>
                  </NavLink>
                  <NavLink to="/admin/orders" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <TruckIcon />
                    <span>Orders</span>
                    <span className="dash-count-pill">{orders.length}</span>
                  </NavLink>
                  <Link to="/import" className="dash-nav-link">
                    <CheckIcon /> <span>Excel / CSV Import ↗</span>
                  </Link>
                </nav>
              </div>

              <div className="dash-nav-group">
                <span className="dash-nav-heading">CMS &amp; Audience</span>
                <nav className="dash-nav">
                  <NavLink to="/admin/blogs" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <HeartIcon />
                    <span>Blog Posts</span>
                    <span className="dash-count-pill">{blogs.length}</span>
                  </NavLink>
                  <NavLink to="/admin/content" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <ShieldIcon /> <span>Offers &amp; Banners</span>
                  </NavLink>
                  <NavLink to="/admin/users" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <UserIcon />
                    <span>Users &amp; Subscribers</span>
                    <span className="dash-count-pill">{allUsers.length}</span>
                  </NavLink>
                </nav>
              </div>
            </div>

            <div className="dash-sidebar-footer">
              <Link to="/account/orders" className="dash-nav-link">
                <UserIcon /> <span>Customer Portal View</span>
              </Link>
              <button
                type="button"
                className="btn ghost wide"
                style={{ marginTop: 10 }}
                onClick={() => {
                  logout();
                  nav('/account');
                }}
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="dash-main">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="dash-stack">
                <div className="dash-header-bar">
                  <div>
                    <span className="eyebrow">Storefront Management Console</span>
                    <h1>Admin Dashboard</h1>
                    <p className="muted" style={{ margin: 0 }}>
                      Manage fragrances, fulfillment tracking, blog articles, offers, and customer accounts in real time.
                    </p>
                  </div>
                  <div className="dash-header-actions">
                    <Link to="/" className="btn ghost">View Storefront ↗</Link>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        nav('/admin/products');
                        openNewProduct();
                      }}
                    >
                      + Add Product
                    </button>
                  </div>
                </div>

                <div className="stat-cards-grid cols-3">
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Gross Revenue</span>
                      <span className="stat-icon-badge"><BagIcon /></span>
                    </div>
                    <strong className="stat-value">{money(totalRevenue)}</strong>
                    <span className="stat-sub">Excludes cancelled orders</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Total Orders</span>
                      <span className="stat-icon-badge"><TruckIcon /></span>
                    </div>
                    <strong className="stat-value">{orders.length}</strong>
                    <span className="stat-sub">{pendingOrdersCount} active fulfillment</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Catalog Products</span>
                      <span className="stat-icon-badge"><ShieldIcon /></span>
                    </div>
                    <strong className="stat-value">{products.length}</strong>
                    <span className="stat-sub">Active across {brands.length - 1} brands</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Blog Articles</span>
                      <span className="stat-icon-badge"><HeartIcon /></span>
                    </div>
                    <strong className="stat-value">{blogs.length}</strong>
                    <span className="stat-sub">{publishedBlogsCount} published live</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Registered Users</span>
                      <span className="stat-icon-badge"><UserIcon /></span>
                    </div>
                    <strong className="stat-value">{allUsers.length}</strong>
                    <span className="stat-sub">Customers &amp; admins</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-top">
                      <span className="stat-label">Newsletter List</span>
                      <span className="stat-icon-badge"><CheckIcon /></span>
                    </div>
                    <strong className="stat-value">{subscribers.length}</strong>
                    <span className="stat-sub">Verified email signups</span>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <h3>Quick Operations</h3>
                      <p className="muted small" style={{ margin: 0 }}>Common catalog, editorial, and promotional shortcuts.</p>
                    </div>
                  </div>
                  <div className="quick-actions-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        nav('/admin/products');
                        openNewProduct();
                      }}
                    >
                      + Add New Perfume
                    </button>
                    <Link to="/import" className="btn ghost">Batch Import Excel / CSV</Link>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        nav('/admin/blogs');
                        openNewBlog();
                      }}
                    >
                      + Publish Blog Post
                    </button>
                    <Link to="/admin/content" className="btn ghost">Edit Offers &amp; Promo Codes</Link>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <h3>Latest Customer Orders</h3>
                      <p className="muted small" style={{ margin: 0 }}>Click Manage Status to update courier tracking numbers.</p>
                    </div>
                    <Link to="/admin/orders" className="login-hint">View All Orders →</Link>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th className="th-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 6).map((o) => (
                          <tr key={o.id}>
                            <td data-label="Order ID"><strong>{o.id}</strong></td>
                            <td data-label="Customer">
                              <div className="table-primary-text">{o.customerName || 'Customer'}</div>
                              <span className="muted small">{o.email}</span>
                            </td>
                            <td data-label="Date">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                            <td data-label="Total"><strong>{money(o.total)}</strong></td>
                            <td data-label="Status">
                              <span className={`status-badge ${getStatusClass(o.status)}`}>
                                {o.status || 'Confirmed'}
                              </span>
                            </td>
                            <td className="td-right" data-label="Action">
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="btn ghost btn-sm"
                                  onClick={() => {
                                    nav('/admin/orders');
                                    openManageOrder(o);
                                  }}
                                >
                                  Manage Status
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <span className="eyebrow">Inventory &amp; Merchandising</span>
                    <h2>Products Catalog CMS ({products.length})</h2>
                    <p className="muted small" style={{ margin: 0 }}>
                      Add, edit, or delete fragrances — works alongside Excel/CSV batch imports.
                    </p>
                  </div>
                  <div className="dash-card-actions">
                    <button type="button" className="btn" onClick={openNewProduct}>+ Add Product</button>
                    <Link to="/import" className="btn ghost">Import Excel</Link>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        if (window.confirm('Restore default base catalog and clear local product overrides?')) {
                          clearCustomProducts();
                          refreshAll();
                          notify('Product catalog restored to default seed.');
                        }
                      }}
                    >
                      Reset Catalog
                    </button>
                  </div>
                </div>

                {editingProduct && (
                  <form onSubmit={handleSaveProduct} className="admin-form-panel">
                    <div className="dash-card-head" style={{ marginBottom: 4, paddingBottom: 12 }}>
                      <h3>{editingProduct === 'new' ? 'Add New Product' : `Edit Product (${editingProduct})`}</h3>
                      <button type="button" className="link-inline-btn" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </button>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Product Title *</label>
                        <input
                          type="text"
                          required
                          value={prodForm.title}
                          onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Brand / House *</label>
                        <input
                          type="text"
                          required
                          value={prodForm.brand}
                          onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Sale Price (GBP £) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={prodForm.price}
                          onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Compare-at RRP (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={prodForm.compare_at_price}
                          onChange={(e) => setProdForm({ ...prodForm, compare_at_price: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bottle Size</label>
                        <input
                          type="text"
                          value={prodForm.size}
                          onChange={(e) => setProdForm({ ...prodForm, size: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Primary Image URL</label>
                        <input
                          type="url"
                          value={prodForm.image_url}
                          onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Collections (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="all, new-in, men, women, sale, gifts"
                          value={prodForm.collectionsText}
                          onChange={(e) => setProdForm({ ...prodForm, collectionsText: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Top Notes</label>
                        <input
                          type="text"
                          value={prodForm.topNotes}
                          onChange={(e) => setProdForm({ ...prodForm, topNotes: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Heart Notes</label>
                        <input
                          type="text"
                          value={prodForm.middleNotes}
                          onChange={(e) => setProdForm({ ...prodForm, middleNotes: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Base Notes</label>
                        <input
                          type="text"
                          value={prodForm.baseNotes}
                          onChange={(e) => setProdForm({ ...prodForm, baseNotes: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows={3}
                        value={prodForm.description}
                        onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                      />
                    </div>
                    <div className="form-panel-footer">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={prodForm.in_stock}
                          onChange={(e) => setProdForm({ ...prodForm, in_stock: e.target.checked })}
                        />
                        <span>In Stock &amp; Available for Purchase</span>
                      </label>
                      <button type="submit" className="btn">Save Product</button>
                    </div>
                  </form>
                )}

                <div className="admin-toolbar">
                  <input
                    type="search"
                    placeholder="Search by product name, brand, or handle…"
                    value={prodQuery}
                    onChange={(e) => setProdQuery(e.target.value)}
                  />
                  <select value={prodBrand} onChange={(e) => setProdBrand(e.target.value)}>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Brand</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th className="th-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.slice(0, 60).map((p) => (
                        <tr key={p.handle}>
                          <td data-label="Product">
                            <div className="table-product-cell">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.title} className="table-thumb" />
                              ) : (
                                <div className="table-thumb ph" />
                              )}
                              <div>
                                <div className="table-primary-text">{p.title}</div>
                                <div className="muted small">{p.size || '100ml'}</div>
                              </div>
                            </div>
                          </td>
                          <td data-label="Brand">{p.brand}</td>
                          <td data-label="Price">
                            <strong>{money(p.price)}</strong>
                            {p.compare_at_price && (
                              <span className="muted small" style={{ textDecoration: 'line-through', marginLeft: 6 }}>
                                {money(p.compare_at_price)}
                              </span>
                            )}
                          </td>
                          <td data-label="Stock">
                            <span className={'status-badge ' + (p.in_stock !== false ? 'delivered' : 'cancelled')}>
                              {p.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="td-right" data-label="Actions">
                            <div className="table-actions">
                              <button type="button" className="btn ghost btn-sm" onClick={() => openEditProduct(p)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn ghost danger-btn btn-sm"
                                onClick={() => handleDeleteProduct(p.handle, p.title)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length > 60 && (
                    <p className="muted small" style={{ marginTop: 12, marginBottom: 0 }}>
                      Showing first 60 of {filteredProducts.length} matching products. Use the search box to filter specific items.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <span className="eyebrow">Dispatch &amp; Tracking</span>
                    <h2>Orders &amp; Fulfillment ({orders.length})</h2>
                    <p className="muted small" style={{ margin: 0 }}>
                      Update order status, Royal Mail / DPD tracking codes, and customer dispatch notes.
                    </p>
                  </div>
                </div>

                {selectedOrder && (
                  <form onSubmit={handleSaveOrder} className="admin-form-panel">
                    <div className="dash-card-head" style={{ marginBottom: 4, paddingBottom: 12 }}>
                      <div>
                        <h3>Manage Order {selectedOrder.id}</h3>
                        <p className="muted small" style={{ margin: 0 }}>
                          {selectedOrder.customerName} ({selectedOrder.email}) • {money(selectedOrder.total)}
                        </p>
                      </div>
                      <button type="button" className="link-inline-btn" onClick={() => setSelectedOrder(null)}>
                        Close Editor
                      </button>
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Order Status</label>
                        <select
                          value={orderEditForm.status}
                          onChange={(e) => setOrderEditForm({ ...orderEditForm, status: e.target.value })}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Courier Service</label>
                        <input
                          type="text"
                          value={orderEditForm.courier}
                          onChange={(e) => setOrderEditForm({ ...orderEditForm, courier: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tracking Number</label>
                        <input
                          type="text"
                          placeholder="e.g. RM849201948GB"
                          value={orderEditForm.trackingNumber}
                          onChange={(e) => setOrderEditForm({ ...orderEditForm, trackingNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Customer Tracking Note (visible in Customer Track Order page)</label>
                      <input
                        type="text"
                        placeholder="e.g. Dispatched from London Distribution Hub."
                        value={orderEditForm.adminNote}
                        onChange={(e) => setOrderEditForm({ ...orderEditForm, adminNote: e.target.value })}
                      />
                    </div>

                    <div className="form-panel-footer">
                      <Link to={`/order-confirmation/${selectedOrder.id}`} className="login-hint">
                        Open Full Receipt →
                      </Link>
                      <button type="submit" className="btn">Save Fulfillment Update</button>
                    </div>
                  </form>
                )}

                <div className="admin-toolbar">
                  <input
                    type="search"
                    placeholder="Search by Order ID, customer name, or email…"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                  />
                  <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Tracking</th>
                        <th className="th-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td data-label="Order"><strong>{o.id}</strong></td>
                          <td data-label="Customer">
                            <div className="table-primary-text">{o.customerName}</div>
                            <span className="muted small">{o.email}</span>
                          </td>
                          <td data-label="Date">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                          <td data-label="Total"><strong>{money(o.total)}</strong></td>
                          <td data-label="Status">
                            <span className={`status-badge ${getStatusClass(o.status)}`}>
                              {o.status || 'Confirmed'}
                            </span>
                          </td>
                          <td className="small" data-label="Tracking">{o.trackingNumber || <span className="muted">Pending</span>}</td>
                          <td className="td-right" data-label="Actions">
                            <div className="table-actions">
                              <button type="button" className="btn ghost btn-sm" onClick={() => openManageOrder(o)}>
                                Manage
                              </button>
                              <button type="button" className="btn ghost danger-btn btn-sm" onClick={() => handleDeleteOrder(o.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BLOGS TAB */}
            {activeTab === 'blogs' && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <span className="eyebrow">Editorial Management</span>
                    <h2>Fragrance Insights Blog CMS ({blogs.length})</h2>
                    <p className="muted small" style={{ margin: 0 }}>
                      Create, edit, publish/unpublish, or remove editorial blog posts directly from the frontend.
                    </p>
                  </div>
                  <div className="dash-card-actions">
                    <button type="button" className="btn" onClick={openNewBlog}>+ New Article</button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        if (window.confirm('Restore default blog posts?')) {
                          resetBlogsAdmin();
                          refreshAll();
                          notify('Default Fragrance Insights articles restored.');
                        }
                      }}
                    >
                      Reset Posts
                    </button>
                  </div>
                </div>

                {editingBlog && (
                  <form onSubmit={handleSaveBlog} className="admin-form-panel">
                    <div className="dash-card-head" style={{ marginBottom: 4, paddingBottom: 12 }}>
                      <h3>{editingBlog === 'new' ? 'Create New Blog Post' : 'Edit Blog Post'}</h3>
                      <button type="button" className="link-inline-btn" onClick={() => setEditingBlog(null)}>Cancel</button>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Headline *</label>
                        <input
                          type="text"
                          required
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <input
                          type="text"
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Date Label</label>
                        <input
                          type="text"
                          value={blogForm.date}
                          onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Read Time</label>
                        <input
                          type="text"
                          value={blogForm.readTime}
                          onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Cover Image URL</label>
                        <input
                          type="url"
                          value={blogForm.img}
                          onChange={(e) => setBlogForm({ ...blogForm, img: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Short Excerpt *</label>
                      <textarea
                        rows={2}
                        required
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Full Article Content *</label>
                      <textarea
                        rows={6}
                        required
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      />
                    </div>
                    <div className="form-panel-footer">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={blogForm.published}
                          onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                        />
                        <span>Published (visible on /blogs/fragrance-insights)</span>
                      </label>
                      <button type="submit" className="btn">Save Article</button>
                    </div>
                  </form>
                )}

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="th-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((post) => (
                        <tr key={post.id}>
                          <td data-label="Title">
                            <div className="table-primary-text">{post.title}</div>
                            <div className="muted small">{post.readTime}</div>
                          </td>
                          <td data-label="Category">{post.category}</td>
                          <td data-label="Date">{post.date}</td>
                          <td data-label="Status">
                            <span className={'status-badge ' + (post.published !== false ? 'delivered' : 'processing')}>
                              {post.published !== false ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="td-right" data-label="Actions">
                            <div className="table-actions">
                              <button type="button" className="btn ghost btn-sm" onClick={() => openEditBlog(post)}>
                                Edit
                              </button>
                              <button type="button" className="btn ghost danger-btn btn-sm" onClick={() => handleDeleteBlog(post.id, post.title)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STOREFRONT CONTENT & OFFERS TAB */}
            {activeTab === 'content' && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <span className="eyebrow">Promotions &amp; Copy</span>
                    <h2>Storefront Banners &amp; Offers CMS</h2>
                    <p className="muted small" style={{ margin: 0 }}>
                      Edit top header announcements and Offers page promotional banners without touching code.
                    </p>
                  </div>
                  <div className="dash-card-actions">
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        if (window.confirm('Restore default storefront announcements and offers text?')) {
                          resetSiteSettings();
                          refreshAll();
                          notify('Storefront settings restored.');
                        }
                      }}
                    >
                      Reset Defaults
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveContent} className="dash-form-stack">
                  <div className="form-group">
                    <label>Top Announcement Bar Messages (one banner message per line)</label>
                    <textarea
                      rows={4}
                      value={announcementsText}
                      onChange={(e) => setAnnouncementsText(e.target.value)}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Offers Page Headline</label>
                      <input
                        type="text"
                        value={contentForm.offersHeadline}
                        onChange={(e) => setContentForm({ ...contentForm, offersHeadline: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Active Promo Code</label>
                      <input
                        type="text"
                        value={contentForm.promoCode}
                        onChange={(e) => setContentForm({ ...contentForm, promoCode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Offers Page Subheadline</label>
                    <input
                      type="text"
                      value={contentForm.offersSubheadline}
                      onChange={(e) => setContentForm({ ...contentForm, offersSubheadline: e.target.value })}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Promo Banner Title</label>
                      <input
                        type="text"
                        value={contentForm.promoTitle}
                        onChange={(e) => setContentForm({ ...contentForm, promoTitle: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Promo Banner Description</label>
                      <input
                        type="text"
                        value={contentForm.promoDescription}
                        onChange={(e) => setContentForm({ ...contentForm, promoDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-panel-footer" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn">Save Storefront Content</button>
                  </div>
                </form>
              </div>
            )}

            {/* USERS & SUBSCRIBERS TAB */}
            {activeTab === 'users' && (
              <div className="dash-stack">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <span className="eyebrow">Access Control</span>
                      <h2>Registered Users &amp; Roles ({allUsers.length})</h2>
                      <p className="muted small" style={{ margin: 0 }}>
                        Create or update customer and admin accounts directly from the UI.
                      </p>
                    </div>
                    <div className="dash-card-actions">
                      <button type="button" className="btn" onClick={openNewUser}>+ Add User</button>
                    </div>
                  </div>

                  {editingUser && (
                    <form onSubmit={handleSaveUser} className="admin-form-panel">
                      <div className="dash-card-head" style={{ marginBottom: 4, paddingBottom: 12 }}>
                        <h3>{editingUser === 'new' ? 'Create New User' : `Edit User (${editingUser})`}</h3>
                        <button type="button" className="link-inline-btn" onClick={() => setEditingUser(null)}>Cancel</button>
                      </div>
                      <div className="form-row-3">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            required
                            value={userForm.name}
                            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email *</label>
                          <input
                            type="email"
                            required
                            disabled={editingUser !== 'new'}
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Role *</label>
                          <select
                            value={userForm.role}
                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row-3">
                        <div className="form-group">
                          <label>{editingUser === 'new' ? 'Password *' : 'New Password (optional)'}</label>
                          <input
                            type="password"
                            required={editingUser === 'new'}
                            placeholder={editingUser === 'new' ? 'Min 6 characters' : 'Leave blank to keep current'}
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            value={userForm.city}
                            onChange={(e) => setUserForm({ ...userForm, city: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          <input
                            type="text"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-panel-footer" style={{ justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn">Save User</button>
                      </div>
                    </form>
                  )}

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>City</th>
                          <th className="th-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u) => (
                          <tr key={u.email}>
                            <td data-label="Name"><strong>{u.name}</strong></td>
                            <td data-label="Email">{u.email}</td>
                            <td data-label="Role">
                              <span className={'role-pill ' + (u.role === 'admin' ? 'admin' : '')}>
                                {u.role}
                              </span>
                            </td>
                            <td data-label="City">{u.city || '—'}</td>
                            <td className="td-right" data-label="Actions">
                              <div className="table-actions">
                                <button type="button" className="btn ghost btn-sm" onClick={() => openEditUser(u)}>
                                  Edit
                                </button>
                                {u.email !== user.email && (
                                  <button
                                    type="button"
                                    className="btn ghost danger-btn btn-sm"
                                    onClick={() => {
                                      if (window.confirm(`Delete user ${u.email}?`)) {
                                        deleteUserAdmin(u.email);
                                        notify(`Deleted ${u.email}.`);
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <span className="eyebrow">Marketing List</span>
                      <h3>Newsletter Subscribers ({subscribers.length})</h3>
                      <p className="muted small" style={{ margin: 0 }}>
                        Visitors subscribed via footer or popup campaigns.
                      </p>
                    </div>
                  </div>
                  {subscribers.length === 0 ? (
                    <p className="muted" style={{ margin: 0 }}>No newsletter subscribers recorded yet.</p>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Source</th>
                            <th>Subscribed Date</th>
                            <th className="th-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscribers.map((sub) => (
                            <tr key={sub.email}>
                              <td data-label="Email"><strong>{sub.email}</strong></td>
                              <td data-label="Source">{sub.source || 'footer'}</td>
                              <td data-label="Subscribed">{sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('en-GB') : '—'}</td>
                              <td className="td-right" data-label="Action">
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="btn ghost danger-btn btn-sm"
                                    onClick={() => {
                                      deleteSubscriberAdmin(sub.email);
                                      refreshAll();
                                      notify(`Removed subscriber ${sub.email}.`);
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
