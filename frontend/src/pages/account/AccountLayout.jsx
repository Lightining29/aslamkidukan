import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Package, Heart, ShoppingBag, LogOut, Shield, User, Menu, X, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransitionCutout from '../../components/common/PageTransitionCutout';
import '../../styles/Panel.css';
import '../../styles/pageTransitions.css';
import './CustomerDashboard.css';

export default function AccountLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="account-page-wrapper pull-page-into-view" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <PageTransitionCutout key={location.pathname} variant="curtain" title="CUSTOMER DASHBOARD" subtitle="MY ORDERS & WISHLIST" />
      <Navbar />

      {/* Mobile Top Bar (Visible ≤ 900px) */}
      <div className="customer-mobile-topbar pull-stagger-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="cust-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>My Account Menu</span>
        </div>

        <div className="vip-chip-sm">
          <Award size={14} color="#FFE600" /> Gold VIP
        </div>
      </div>

      {/* Off-canvas Overlay */}
      {mobileMenuOpen && (
        <div className="cust-overlay-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="panel-layout container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
        
        {/* Customer Sidebar Drawer */}
        <aside className={`panel-sidebar cust-account-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          
          <div className="panel-sidebar-header cust-profile-box">
            <div className="cust-drawer-top-close">
              <button
                className="cust-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {user?.photoUrl ? (
              <img 
                src={user.photoUrl} 
                alt={user.name} 
                className="cust-avatar-img"
              />
            ) : (
              <div className="cust-avatar-placeholder">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            <h2 className="cust-name">{user?.name || 'Valued Customer'}</h2>
            <p className="cust-email">{user?.email || 'customer@aaanenterprises.com'}</p>

            <div className="cust-vip-badge-row">
              <Award size={14} color="#F59E0B" />
              <span>🥇 Gold VIP Member</span>
            </div>
          </div>

          <nav className="panel-nav cust-nav-links">
            <NavLink to="/account" end onClick={() => setMobileMenuOpen(false)}>
              <Package size={18} /> Dashboard &amp; Live Tracking
            </NavLink>
            <NavLink to="/account/wishlist" onClick={() => setMobileMenuOpen(false)}>
              <Heart size={18} /> Wishlist &amp; Saved
            </NavLink>
            <NavLink to="/account/settings" onClick={() => setMobileMenuOpen(false)}>
              <User size={18} /> Account Settings
            </NavLink>
            <NavLink to="/cart" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingBag size={18} /> Shopping Cart
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Shield size={18} /> Admin Control Panel
              </NavLink>
            )}
            <button onClick={handleLogout} className="btn-cust-logout">
              <LogOut size={18} /> Sign Out Account
            </button>
          </nav>

        </aside>

        <main className="panel-content cust-main-content pull-stagger-2">
          <Outlet />
        </main>

      </div>

      <Footer />
    </div>
  );
}
