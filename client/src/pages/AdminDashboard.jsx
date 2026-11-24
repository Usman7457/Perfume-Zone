import { useState, useEffect, useMemo, useRef } from 'react';
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
  deleteSubscriberAdmin,
  DISCOUNT_CATEGORIES,
  getCategoryDiscounts,
  saveCategoryDiscount,
  toggleCategoryDiscount,
  deleteCategoryDiscount
} from '../api.js';
import { ShieldIcon, TruckIcon, UserIcon, CheckIcon, BagIcon, HeartIcon, TagIcon } from '../components/Icons.jsx';
import CmsEditor from '../components/CmsEditor.jsx';
import ImageUploadField from '../components/ImageUploadField.jsx';

const EMPTY_PRODUCT_FORM = {
  handle: '',
  title: '',
  brand: '',
  price: '',
  compare_at_price: '',
  sku: '',
  stock_quantity: '15',
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

const EMPTY_DISCOUNT_FORM = {
  id: '',
  title: '',
  categories: ['all'],
  category: 'all',
  type: 'percent',
  value: '20',
  active: true
};

const DISCOUNT_PRESETS = [
  { title: 'Flash Sale: 20% Off For Him', categories: ['for-him'], category: 'for-him', type: 'percent', value: '20' },
  { title: 'Spring Special: 20% Off For Her', categories: ['for-her'], category: 'for-her', type: 'percent', value: '20' },
  { title: 'Exclusive: 15% Off Unisex', categories: ['unisex-perfume'], category: 'unisex-perfume', type: 'percent', value: '15' },
  { title: 'Storewide: 10% Off Everything', categories: ['all'], category: 'all', type: 'percent', value: '10' },
  { title: 'VIP Offer: £10 Flat Off Best Sellers', categories: ['best-sellers'], category: 'best-sellers', type: 'flat', value: '10' },
  { title: 'Brand Event: 25% Off Lattafa', categories: ['lattafa'], category: 'lattafa', type: 'percent', value: '25' }
];

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
    offersSubheadline: '',
    popupEnabled: true,
    popupTitle: '',
    popupSubtitle: '',
    popupDescription: '',
    popupImage: '',
    popupCtaText: '',
    popupCtaLink: ''
  });

  // Users tab states
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);

  // Discounts tab states
  const discountFormRef = useRef(null);
  const [discounts, setDiscounts] = useState(getCategoryDiscounts());
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState(EMPTY_DISCOUNT_FORM);
  const [catSearch, setCatSearch] = useState('');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

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
      offersSubheadline: s.offersSubheadline || '',
      popupEnabled: s.popupEnabled !== false,
      popupTitle: s.popupTitle || '',
      popupSubtitle: s.popupSubtitle || '',
      popupDescription: s.popupDescription || '',
      popupImage: s.popupImage || '',
      popupCtaText: s.popupCtaText || '',
      popupCtaLink: s.popupCtaLink || ''
    });
    const subs = await getSubscribersAdmin();
    setSubscribers(Array.isArray(subs) ? subs : []);
    setDiscounts(getCategoryDiscounts());
  };

  useEffect(() => {
    refreshAll();
    const onChange = () => refreshAll();
    window.addEventListener('pz:products-change', onChange);
    window.addEventListener('pz:orders-change', onChange);
    window.addEventListener('pz:blogs-change', onChange);
    window.addEventListener('pz:settings-change', onChange);
    window.addEventListener('pz:discounts-change', onChange);
    return () => {
      window.removeEventListener('pz:products-change', onChange);
      window.removeEventListener('pz:orders-change', onChange);
      window.removeEventListener('pz:blogs-change', onChange);
      window.removeEventListener('pz:settings-change', onChange);
      window.removeEventListener('pz:discounts-change', onChange);
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
      price: String(p._base_price != null ? p._base_price : (p.price ?? '')),
      compare_at_price: p._base_compare_at !== undefined ? (p._base_compare_at ? String(p._base_compare_at) : '') : (p.compare_at_price ? String(p.compare_at_price) : ''),
      size: p.size || '100ml Eau de Parfum',
      collectionsText: Array.isArray(p.collections) ? p.collections.join(', ') : '',
      image_url: p.image_url || '',
      image_url_2: p.image_url_2 || '',
      description: p.description || '',
      topNotes: Array.isArray(p.notes?.top) ? p.notes.top.join(', ') : '',
      middleNotes: Array.isArray(p.notes?.middle) ? p.notes.middle.join(', ') : '',
      baseNotes: Array.isArray(p.notes?.base) ? p.notes.base.join(', ') : '',
      in_stock: p.in_stock !== false,
      sku: p.sku || ('PZ-' + String(p.id || 1).padStart(4, '0')),
      stock_quantity: p.stock_quantity != null ? String(p.stock_quantity) : '15'
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
      in_stock: Boolean(prodForm.in_stock),
      sku: prodForm.sku.trim() || ('PZ-' + String(Date.now()).slice(-4)),
      stock_quantity: prodForm.stock_quantity !== '' ? Math.max(0, parseInt(prodForm.stock_quantity, 10) || 0) : (prodForm.in_stock ? 15 : 0)
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

  // --- Handlers: Category Discounts ---
  const scrollToDiscountForm = () => {
    setTimeout(() => {
      if (discountFormRef.current) {
        discountFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const openNewDiscount = () => {
    setDiscountForm(EMPTY_DISCOUNT_FORM);
    setEditingDiscount('new');
    setCatDropdownOpen(false);
    scrollToDiscountForm();
  };

  const openEditDiscount = (d) => {
    let cats = [];
    if (Array.isArray(d.categories) && d.categories.length) {
      cats = d.categories;
    } else if (d.category) {
      cats = String(d.category).split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!cats.length) cats = ['all'];

    setDiscountForm({
      id: d.id,
      title: d.title || '',
      categories: cats,
      category: cats.join(', '),
      type: d.type || 'percent',
      value: String(d.value ?? '20'),
      active: d.active !== false
    });
    setEditingDiscount(d.id);
    setCatDropdownOpen(false);
    scrollToDiscountForm();
  };

  const handleToggleCategorySelection = (catValue) => {
    setDiscountForm((prev) => {
      let current = [...(prev.categories || ['all'])];
      if (catValue === 'all') {
        return { ...prev, categories: ['all'], category: 'all' };
      }
      current = current.filter((c) => c !== 'all');
      if (current.includes(catValue)) {
        current = current.filter((c) => c !== catValue);
      } else {
        current.push(catValue);
      }
      if (!current.length) {
        current = ['all'];
      }
      return {
        ...prev,
        categories: current,
        category: current.join(', ')
      };
    });
  };

  const handleSaveDiscount = (e) => {
    e.preventDefault();
    if (!discountForm.title.trim()) {
      notify('Please enter a promotion title.');
      return;
    }
    const val = Number(discountForm.value);
    if (isNaN(val) || val <= 0) {
      notify('Please enter a valid discount amount greater than zero.');
      return;
    }
    if (discountForm.type === 'percent' && val > 90) {
      notify('Percentage discount cannot exceed 90%.');
      return;
    }
    const cats = discountForm.categories && discountForm.categories.length ? discountForm.categories : ['all'];
    saveCategoryDiscount({
      ...discountForm,
      categories: cats,
      category: cats.join(', '),
      value: val
    });
    setEditingDiscount(null);
    setDiscountForm(EMPTY_DISCOUNT_FORM);
    setCatDropdownOpen(false);
    refreshAll();
    notify(`Promotion "${discountForm.title}" saved successfully! Store prices updated.`);
  };

  const handleToggleDiscount = (id) => {
    const updated = toggleCategoryDiscount(id);
    refreshAll();
    if (updated) {
      notify(`Promotion "${updated.title}" is now ${updated.active ? 'ACTIVE' : 'PAUSED'}.`);
    }
  };

  const handleDeleteDiscount = (d) => {
    if (window.confirm(`Delete promotion "${d.title}"? This will restore original prices on the storefront.`)) {
      deleteCategoryDiscount(d.id);
      refreshAll();
      notify(`Deleted promotion "${d.title}".`);
    }
  };

  const applyDiscountPreset = (preset) => {
    const cats = Array.isArray(preset.categories) ? preset.categories : [preset.category || 'all'];
    setDiscountForm({
      id: '',
      title: preset.title,
      categories: cats,
      category: cats.join(', '),
      type: preset.type,
      value: String(preset.value),
      active: true
    });
    setEditingDiscount('new');
    setCatDropdownOpen(false);
    scrollToDiscountForm();
  };

  const activeDiscountsCount = discounts.filter((d) => d.active).length;

  const selectedDiscountCategories = useMemo(() => {
    if (Array.isArray(discountForm.categories) && discountForm.categories.length) {
      return discountForm.categories;
    }
    if (discountForm.category) {
      return String(discountForm.category).split(',').map((s) => s.trim()).filter(Boolean);
    }
    return ['all'];
  }, [discountForm.categories, discountForm.category]);

  const filteredDiscountCategories = useMemo(() => {
    if (!catSearch.trim()) return DISCOUNT_CATEGORIES;
    const q = catSearch.trim().toLowerCase();
    return DISCOUNT_CATEGORIES.filter(
      (c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)
    );
  }, [catSearch]);

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
                  <NavLink to="/admin/discounts" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <TagIcon />
                    <span>Category Discounts</span>
                    <span className="dash-count-pill active-promo">{activeDiscountsCount}</span>
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
                  <NavLink to="/admin/pages" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <ShieldIcon /> <span>Pages &amp; Navigation CMS</span>
                  </NavLink>
                  <NavLink to="/admin/blogs" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <HeartIcon />
                    <span>Blog Posts</span>
                    <span className="dash-count-pill">{blogs.length}</span>
                  </NavLink>
                  <NavLink to="/admin/content" className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}>
                    <TagIcon /> <span>Offers &amp; Banners</span>
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
                      <span className="stat-label">Category Promotions</span>
                      <span className="stat-icon-badge"><TagIcon /></span>
                    </div>
                    <strong className="stat-value">{activeDiscountsCount} Active</strong>
                    <span className="stat-sub">{discounts.length} rules configured</span>
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
                    <Link to="/admin/discounts" className="btn ghost">Category Promotions →</Link>
                    <Link to="/admin/pages" className="btn ghost">Pages &amp; Navigation CMS →</Link>
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
                        <label>SKU (Stock Keeping Unit)</label>
                        <input
                          type="text"
                          placeholder="e.g. PZ-1001-OUD"
                          value={prodForm.sku}
                          onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Stock Quantity (Units)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 15"
                          value={prodForm.stock_quantity}
                          onChange={(e) => setProdForm({ ...prodForm, stock_quantity: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row-2" style={{ alignItems: 'flex-start', margin: '8px 0' }}>
                      <ImageUploadField
                        label="Primary Product Image (Choose File from Computer) *"
                        value={prodForm.image_url}
                        onChange={(img) => setProdForm({ ...prodForm, image_url: img })}
                        previewHeight={140}
                        helpText="Select bottle image file from your device"
                      />
                      <ImageUploadField
                        label="Secondary Flacon / Packaging Image (Optional)"
                        value={prodForm.image_url_2}
                        onChange={(img) => setProdForm({ ...prodForm, image_url_2: img })}
                        previewHeight={140}
                        helpText="Select hover image or packaging box file"
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
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock / Qty</th>
                        <th className="th-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.slice(0, 60).map((p) => {
                        const inStock = p.in_stock !== false && p.in_stock !== 0;
                        const qty = p.stock_quantity != null ? p.stock_quantity : (inStock ? 15 : 0);
                        const sku = p.sku || ('PZ-' + String(p.id || 1).padStart(4, '0'));
                        return (
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
                            <td data-label="SKU">
                              <span className="sku-badge">{sku}</span>
                            </td>
                            <td data-label="Price">
                              <strong>{money(p.price)}</strong>
                              {p.compare_at_price && (
                                <span className="muted small" style={{ textDecoration: 'line-through', marginLeft: 6 }}>
                                  {money(p.compare_at_price)}
                                </span>
                              )}
                            </td>
                            <td data-label="Stock">
                              <span className={'status-badge ' + (inStock && qty > 0 ? (qty <= 5 ? 'processing' : 'delivered') : 'cancelled')}>
                                {inStock && qty > 0 ? `${qty} in stock` : 'Out of stock'}
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
                        );
                      })}
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
                          {selectedOrder.customerName} ({selectedOrder.email}) • {money(selectedOrder.total)} • <strong>Platform:</strong> {selectedOrder.paymentPlatform || selectedOrder.paymentMethod || 'Stripe / Card'}
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
                        <th>Payment</th>
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
                          <td data-label="Payment">
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: '#f1f5f9',
                                color: '#1e293b',
                                border: '1px solid #e2e8f0',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {o.paymentPlatform || (
                                o.paymentMethod === 'googlepay' ? 'Google Pay' :
                                  o.paymentMethod === 'paypal' ? 'PayPal' :
                                    o.paymentMethod === 'klarna' ? 'Klarna' :
                                      o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe / Card'
                              )}
                            </span>
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

            {/* PAGES & NAVIGATION CMS TAB */}
            {activeTab === 'pages' && (
              <CmsEditor notify={notify} />
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

                  <div className="form-divider" style={{ margin: '26px 0 16px', borderTop: '1px solid var(--line)' }} />
                  <div className="dash-card-head" style={{ padding: 0, marginBottom: 12 }}>
                    <div>
                      <span className="eyebrow">Guest / Offline Visitor Modal</span>
                      <h3>Website Load Offers Pop-up</h3>
                      <p className="muted small" style={{ margin: 0 }}>
                        Greets offline / non-signed in guests in the center of the screen on page load. Never shows to logged-in customers or admins.
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={contentForm.popupEnabled}
                        onChange={(e) => setContentForm({ ...contentForm, popupEnabled: e.target.checked })}
                      />
                      <strong>Enable Offers Pop-up for Offline (Guest) Visitors</strong>
                    </label>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Pop-up Title / Main Heading</label>
                      <input
                        type="text"
                        value={contentForm.popupTitle}
                        onChange={(e) => setContentForm({ ...contentForm, popupTitle: e.target.value })}
                        placeholder="e.g. 10% Off Your First Fragrance"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pop-up Subtitle / Eyebrow Badge</label>
                      <input
                        type="text"
                        value={contentForm.popupSubtitle}
                        onChange={(e) => setContentForm({ ...contentForm, popupSubtitle: e.target.value })}
                        placeholder="e.g. EXCLUSIVE WELCOME PRIVILEGE"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Pop-up Description</label>
                    <textarea
                      rows={2}
                      value={contentForm.popupDescription}
                      onChange={(e) => setContentForm({ ...contentForm, popupDescription: e.target.value })}
                      placeholder="e.g. Unlock instant savings across authentic Dubai luxury perfumes, rare artisan oud, and concentrated attars with code PERFUME10."
                    />
                  </div>

                  <div className="form-row-2" style={{ alignItems: 'flex-start' }}>
                    <ImageUploadField
                      label="Pop-up Promotional Half-Image (Choose File from Computer)"
                      value={contentForm.popupImage}
                      onChange={(img) => setContentForm({ ...contentForm, popupImage: img })}
                      previewHeight={140}
                      helpText="Choose image file from computer for guest popup"
                    />
                    <div className="form-group">
                      <label>Button Label &amp; Target Link</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                        <input
                          type="text"
                          value={contentForm.popupCtaText}
                          onChange={(e) => setContentForm({ ...contentForm, popupCtaText: e.target.value })}
                          placeholder="Button Text (e.g. Explore Offers)"
                        />
                        <input
                          type="text"
                          value={contentForm.popupCtaLink}
                          onChange={(e) => setContentForm({ ...contentForm, popupCtaLink: e.target.value })}
                          placeholder="Link (e.g. /collections/all)"
                        />
                      </div>
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

            {/* CATEGORY DISCOUNTS TAB */}
            {activeTab === 'discounts' && (
              <div className="dash-stack">
                <div className="dash-header-bar">
                  <div>
                    <span className="eyebrow">Promotions &amp; Offer Engine</span>
                    <h1>Category Discounts</h1>
                    <p className="muted" style={{ margin: 0 }}>
                      Apply flat (£) or percentage (%) discounts by product category, fragrance family, brand, or entire store.
                    </p>
                  </div>
                  <div className="dash-header-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={openNewDiscount}
                    >
                      + Create Discount Rule
                    </button>
                  </div>
                </div>

                {/* Stacking Rule Banner */}
                <div className="discount-policy-callout">
                  <span className="policy-icon">🛡️</span>
                  <div className="policy-text">
                    <strong>Automatic Checkout Stacking Protection:</strong>
                    <span> When any product is on promotional category sale, promo coupon code fields are automatically hidden and unapplied at Checkout and Bag, strictly adhering to professional retail standards.</span>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="dash-card">
                  <div className="dash-card-head" style={{ marginBottom: 6 }}>
                    <div>
                      <h3>Quick Launch Promotional Presets</h3>
                      <p className="muted small" style={{ margin: 0 }}>Launch popular sales campaigns with a single click or tailor parameters to your need.</p>
                    </div>
                  </div>
                  <div className="discount-presets-grid">
                    {DISCOUNT_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="preset-chip-btn"
                        onClick={() => applyDiscountPreset(p)}
                      >
                        <span className="chip-badge">{p.type === 'percent' ? `${p.value}% OFF` : `£${p.value} OFF`}</span>
                        <span className="chip-title">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add / Edit Form Panel */}
                {editingDiscount && (
                  <form ref={discountFormRef} onSubmit={handleSaveDiscount} className="admin-form-panel">
                    <div className="dash-card-head" style={{ marginBottom: 4, paddingBottom: 12 }}>
                      <h3>{editingDiscount === 'new' ? 'Create New Category Promotion' : 'Edit Promotion Rule'}</h3>
                      <button type="button" className="link-inline-btn" onClick={() => setEditingDiscount(null)}>
                        Cancel
                      </button>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Campaign / Rule Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramadan Special: 20% Off Men's Fragrances"
                          value={discountForm.title}
                          onChange={(e) => setDiscountForm({ ...discountForm, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group multi-select-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label style={{ margin: 0 }}>Target Fragrance Category or Brand *</label>
                          <span className="muted small" style={{ fontSize: '11px' }}>Multiple selection supported</span>
                        </div>

                        {/* Multi-select dropdown toggle */}
                        <div className="multi-select-wrapper">
                          <button
                            type="button"
                            className={`multi-select-btn ${catDropdownOpen ? 'open' : ''}`}
                            onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                          >
                            <span className="multi-select-summary">
                              {selectedDiscountCategories.includes('all')
                                ? '✨ All Fragrances (Entire Storewide)'
                                : `${selectedDiscountCategories.length} Categories/Brands selected`}
                            </span>
                            <span className="multi-select-arrow">{catDropdownOpen ? '▲' : '▼'}</span>
                          </button>

                          {catDropdownOpen && (
                            <div className="multi-select-popover">
                              <div className="multi-select-search-wrap">
                                <input
                                  type="text"
                                  placeholder="Search categories or brands…"
                                  value={catSearch}
                                  onChange={(e) => setCatSearch(e.target.value)}
                                  autoFocus
                                  className="multi-select-search-input"
                                />
                                <div className="multi-select-quick-actions">
                                  <button
                                    type="button"
                                    className="mini-tag-btn"
                                    onClick={() => {
                                      setDiscountForm({ ...discountForm, categories: ['all'], category: 'all' });
                                    }}
                                  >
                                    Storewide (All)
                                  </button>
                                  <button
                                    type="button"
                                    className="mini-tag-btn"
                                    onClick={() => {
                                      const allValues = DISCOUNT_CATEGORIES.filter((c) => c.value !== 'all').map((c) => c.value);
                                      setDiscountForm({ ...discountForm, categories: allValues, category: allValues.join(', ') });
                                    }}
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    className="mini-tag-btn"
                                    onClick={() => setCatSearch('')}
                                  >
                                    Clear Search
                                  </button>
                                </div>
                              </div>

                              <div className="multi-select-list">
                                {filteredDiscountCategories.map((c) => {
                                  const checked = selectedDiscountCategories.includes(c.value);
                                  return (
                                    <label key={c.value} className={`multi-select-row ${checked ? 'selected' : ''}`}>
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => handleToggleCategorySelection(c.value)}
                                      />
                                      <span className="row-label">{c.label}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              <div className="multi-select-footer-bar">
                                <span className="muted small">
                                  {selectedDiscountCategories.includes('all') ? 'Storewide' : `${selectedDiscountCategories.length} selected`}
                                </span>
                                <button
                                  type="button"
                                  className="btn ghost btn-sm"
                                  onClick={() => setCatDropdownOpen(false)}
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Selected tags list */}
                        <div className="selected-chips-row">
                          {selectedDiscountCategories.map((catVal) => {
                            const found = DISCOUNT_CATEGORIES.find((c) => c.value === catVal);
                            const label = found ? found.label : catVal;
                            return (
                              <span key={catVal} className="category-chip">
                                <span>{label}</span>
                                {selectedDiscountCategories.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCategorySelection(catVal)}
                                    title={`Remove ${label}`}
                                    className="chip-remove-btn"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Discount Type *</label>
                        <select
                          value={discountForm.type}
                          onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                        >
                          <option value="percent">Percentage (% Off)</option>
                          <option value="flat">Flat Amount (£ Off per item)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>{discountForm.type === 'percent' ? 'Discount Percentage (%) *' : 'Flat Reduction (£) *'}</label>
                        <input
                          type="number"
                          step={discountForm.type === 'percent' ? '1' : '0.01'}
                          min="0.5"
                          max={discountForm.type === 'percent' ? '90' : '500'}
                          required
                          value={discountForm.value}
                          onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
                          <input
                            type="checkbox"
                            checked={discountForm.active}
                            onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.checked })}
                          />
                          <span>Activate Promotion Immediately</span>
                        </label>
                      </div>
                    </div>

                    {/* Interactive Live Price Simulation */}
                    {(() => {
                      const val = Number(discountForm.value) || 0;
                      const sampleBase = 50.00;
                      const sampleSaving = discountForm.type === 'percent' ? (sampleBase * val) / 100 : val;
                      const sampleNew = Math.max(1, Math.round((sampleBase - sampleSaving) * 100) / 100);
                      const samplePercent = Math.round(((sampleBase - sampleNew) / sampleBase) * 100);
                      return (
                        <div className="discount-simulation-box">
                          <div className="sim-heading">
                            <span>⚡ Live Storefront Preview (Example £50.00 Perfume)</span>
                          </div>
                          <div className="sim-body">
                            <div className="sim-prices">
                              <span className="sim-old"><s>{money(sampleBase)}</s></span>
                              <span className="sim-arrow">→</span>
                              <strong className="sim-new">{money(sampleNew)}</strong>
                              <span className="sim-tag">
                                {discountForm.type === 'percent' ? `-${Math.round(val)}% OFF` : `-£${val.toFixed(2)} FLAT`}
                              </span>
                            </div>
                            <span className="sim-savings">Customer saves <strong>{money(sampleSaving)}</strong> ({samplePercent}% reduction)</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="form-panel-footer">
                      <button type="submit" className="btn">
                        {editingDiscount === 'new' ? 'Launch Promotion Rule' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Promotions Table */}
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div>
                      <span className="eyebrow">Active &amp; Scheduled Offers</span>
                      <h3>Configured Category Promotions ({discounts.length})</h3>
                      <p className="muted small" style={{ margin: 0 }}>
                        {activeDiscountsCount} active discount {activeDiscountsCount === 1 ? 'rule' : 'rules'} currently reducing prices storefront-wide.
                      </p>
                    </div>
                  </div>

                  {discounts.length === 0 ? (
                    <div className="empty-discounts-state">
                      <p className="muted">No category discount rules created yet.</p>
                      <button type="button" className="btn ghost" onClick={openNewDiscount}>
                        + Create Your First Category Discount
                      </button>
                    </div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Campaign Name</th>
                            <th>Category / Scope</th>
                            <th>Discount</th>
                            <th>Created</th>
                            <th className="th-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discounts.map((d) => {
                            const catObj = DISCOUNT_CATEGORIES.find((c) => c.value === d.category);
                            const catLabel = catObj ? catObj.label : d.category;
                            return (
                              <tr key={d.id}>
                                <td data-label="Status">
                                  <button
                                    type="button"
                                    className={`discount-status-pill ${d.active ? 'active' : 'paused'}`}
                                    onClick={() => handleToggleDiscount(d.id)}
                                    title="Click to toggle status"
                                  >
                                    <span className="dot" />
                                    {d.active ? 'Active' : 'Paused'}
                                  </button>
                                </td>
                                <td data-label="Campaign Name">
                                  <strong>{d.title}</strong>
                                </td>
                                <td data-label="Category / Scope">
                                  <div className="table-cat-badges-wrap">
                                    {(() => {
                                      let cats = [];
                                      if (Array.isArray(d.categories) && d.categories.length) {
                                        cats = d.categories;
                                      } else if (d.category) {
                                        cats = String(d.category).split(',').map((s) => s.trim()).filter(Boolean);
                                      }
                                      if (!cats.length) cats = ['all'];
                                      return cats.map((cVal) => {
                                        const found = DISCOUNT_CATEGORIES.find((c) => c.value === cVal);
                                        return (
                                          <span key={cVal} className="cat-badge">
                                            {found ? found.label : cVal}
                                          </span>
                                        );
                                      });
                                    })()}
                                  </div>
                                </td>
                                <td data-label="Discount">
                                  <span className="disc-val-badge">
                                    {d.type === 'percent' ? `${d.value}% OFF` : `£${Number(d.value).toFixed(2)} OFF`}
                                  </span>
                                </td>
                                <td data-label="Created">
                                  {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : '—'}
                                </td>
                                <td className="td-right" data-label="Actions">
                                  <div className="table-actions">
                                    <button
                                      type="button"
                                      className="btn ghost btn-sm"
                                      onClick={() => handleToggleDiscount(d.id)}
                                    >
                                      {d.active ? 'Pause' : 'Activate'}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn ghost btn-sm"
                                      onClick={() => openEditDiscount(d)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn ghost danger-btn btn-sm"
                                      onClick={() => handleDeleteDiscount(d)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
