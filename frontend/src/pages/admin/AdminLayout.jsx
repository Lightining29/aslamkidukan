import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, PlusCircle, LogOut, Home, Mail, Boxes,
  Menu, X, Star, Zap, Image, Search, Bell, ShieldCheck, Tag, BarChart3, Store, CheckCircle,
  TrendingUp, Users, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AaanLogo from '../../components/common/AaanLogo';
import PageTransitionCutout from '../../components/common/PageTransitionCutout';
import '../../styles/Panel.css';
import '../../styles/pageTransitions.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Close the drawer on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSignOut = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/admin/products?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="panel-layout pull-page-into-view">
      <PageTransitionCutout key={location.pathname} variant="curtain" title="AAAN SUPPLIER PORTAL" subtitle="MANAGEMENT & DISPATCH HUB" />
      {/* AAAN Enterprises Top Header Bar */}
      <header className="meesho-top-header pull-stagger-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="admin-menu-toggle"
            style={{ display: 'none' }} // Mobile responsive toggle
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="meesho-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AaanLogo size="sm" light={true} />
            <span style={{ fontWeight: 800 }}>AAAN Supplier Portal</span>
            <span className="meesho-hub-badge">Verified Hub</span>
          </div>
        </div>

        <form className="meesho-top-search" onSubmit={handleSearchSubmit}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search catalog, order ID, product name, or SKU..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </form>

        <div className="meesho-top-right">
          <div className="meesho-status-pill">
            <span className="meesho-status-dot" />
            <span>Store Live · Express Shipping</span>
          </div>
          <button style={{ border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '50px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFE600', color: '#9f2089', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Meesho Supplier'}</span>
          </div>
        </div>
      </header>

      {/* Meesho Admin Navigation Sidebar */}
      <aside className={`panel-sidebar pull-stagger-1 ${menuOpen ? 'open' : ''}`}>
        <div>
          <div className="panel-sidebar-header">
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--meesho-magenta)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Supplier Portal
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>Manage orders, catalogs &amp; sales</p>
          </div>

          <nav className="panel-nav">
            <NavLink to="/admin" end onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/products/new" onClick={() => setMenuOpen(false)}>
              <PlusCircle size={18} /> Add New Catalog
            </NavLink>
            <NavLink to="/admin/ai-generator" onClick={() => setMenuOpen(false)}>
              <Sparkles size={18} /> AI Content Generator
            </NavLink>
            <NavLink to="/admin/image-enhancer" onClick={() => setMenuOpen(false)}>
              <Image size={18} /> AI Image Enhancer
            </NavLink>
            <NavLink to="/admin/email-generator" onClick={() => setMenuOpen(false)}>
              <Mail size={18} /> AI Email Generator
            </NavLink>
            <NavLink to="/admin/marketing" onClick={() => setMenuOpen(false)}>
              <Zap size={18} /> Marketing &amp; Growth Hub
            </NavLink>
            <NavLink to="/admin/orders" onClick={() => setMenuOpen(false)}>
              <Package size={18} /> Orders &amp; Fulfillments
            </NavLink>
            <NavLink to="/admin/products" onClick={() => setMenuOpen(false)}>
              <ShoppingCart size={18} /> Catalog &amp; Products
            </NavLink>
            <NavLink to="/admin/products/new" onClick={() => setMenuOpen(false)}>
              <PlusCircle size={18} /> Add New Catalog
            </NavLink>
            <NavLink to="/admin/stock" onClick={() => setMenuOpen(false)}>
              <Boxes size={18} /> Stock &amp; Inventory
            </NavLink>
            <NavLink to="/admin/categories" onClick={() => setMenuOpen(false)}>
              <BarChart3 size={18} /> Categories
            </NavLink>
            <NavLink to="/admin/analytics" onClick={() => setMenuOpen(false)}>
              <TrendingUp size={18} /> Analytics &amp; Reports
            </NavLink>
            <NavLink to="/admin/coupons" onClick={() => setMenuOpen(false)}>
              <Tag size={18} /> Coupons &amp; Promo Codes
            </NavLink>
            <NavLink to="/admin/customers" onClick={() => setMenuOpen(false)}>
              <Users size={18} /> Customer Directory
            </NavLink>
            <NavLink to="/admin/flash-sale" onClick={() => setMenuOpen(false)}>
              <Zap size={18} /> Flash Sales &amp; Deals
            </NavLink>
            <NavLink to="/admin/promo-banners" onClick={() => setMenuOpen(false)}>
              <Image size={18} /> Banner &amp; Ads
            </NavLink>
            <NavLink to="/admin/offline-sale" onClick={() => setMenuOpen(false)}>
              <Tag size={18} /> Offline Sales / POS
            </NavLink>
            <NavLink to="/admin/reviews" onClick={() => setMenuOpen(false)}>
              <Star size={18} /> Customer Ratings
            </NavLink>
            <NavLink to="/admin/contacts" onClick={() => setMenuOpen(false)}>
              <Mail size={18} /> Support Messages
            </NavLink>
          </nav>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', marginBottom: '10px' }}>
            <Home size={18} /> View Storefront
          </NavLink>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FF4757', border: 'none', background: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', padding: 0 }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="panel-content pull-stagger-2">
        <Outlet />
      </main>
    </div>
  );
}
