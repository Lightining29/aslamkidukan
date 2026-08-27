import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Heart, Menu, X, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toastSuccess } from '../../utils/toast.js';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Home Decor', href: '#products-catalog-section' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const { cartCount, wishlist = [] } = useCart();
  const { user, isAdmin, logout, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartBumping, setCartBumping] = useState(false);

  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  useEffect(() => {
    if (cartCount > 0) {
      setCartBumping(true);
      const timer = setTimeout(() => setCartBumping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleNavClick(e, link) {
    setMenuOpen(false);
    e.preventDefault();
    const id = link.href.startsWith('#') ? link.href.slice(1) : link.href;

    if (id === 'home' || id === '/') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/?section=${id}#${id}`);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setQuery('');
    navigate(`/?q=${encodeURIComponent(q)}#products-catalog-section`);
  }

  const handleOpenLogin = (mode = 'login') => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    if (typeof setShowLoginModal === 'function') {
      setShowLoginModal(mode);
    }
  };

  return (
    <header className={`luxury-navbar ${scrolled ? 'scrolled' : ''}`} id="home">
      <div className="container luxury-navbar-inner">
        
        {/* Brand Logo */}
        <Link to="/" className="luxury-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon-emblem">🌿</div>
          <div className="logo-text-block">
            <span className="logo-brand-name">AAAN Cart</span>
            <span className="logo-brand-sub">3D Wall Decor</span>
          </div>
        </Link>

        {/* Desktop Navigation Links: Home, All 3D Stickers, About */}
        <nav className={`luxury-nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="luxury-nav-link"
            >
              {link.label}
            </a>
          ))}

          {/* Mobile-only auth buttons inside drawer */}
          <div className="mobile-drawer-auth-row">
            {!user ? (
              <button className="drawer-auth-btn signin" onClick={() => handleOpenLogin('login')}>
                <User size={16} /> Sign In / Register
              </button>
            ) : (
              <button className="drawer-auth-btn signout" onClick={() => { logout(); setMenuOpen(false); }}>
                Sign Out ({user.name})
              </button>
            )}
          </div>
        </nav>

        {/* Search & Actions */}
        <div className="luxury-nav-actions">
          
          {/* Beautiful Search Bar */}
          <form className="luxury-search-form" onSubmit={handleSearchSubmit}>
            <Search size={16} className="luxury-search-icon" />
            <input
              type="text"
              placeholder="Search 3D plants, butterflies & niches…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="luxury-search-input"
            />
            {query && (
              <button
                type="button"
                className="search-clear-cross"
                onClick={() => setQuery('')}
              >
                ×
              </button>
            )}
          </form>

          {/* Wishlist Shortcut */}
          <Link to="/account/wishlist" className="luxury-action-btn" aria-label="Wishlist" title="Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 && <span className="action-badge-dot">{wishlistCount}</span>}
          </Link>

          {/* Single Sign In / Register Modal Trigger (Desktop) */}
          {!user ? (
            <button
              className="nav-auth-single-btn"
              onClick={() => handleOpenLogin('login')}
            >
              <User size={16} />
              <span>Sign In / Register</span>
            </button>
          ) : (
            /* Logged-In User Profile Avatar & Dropdown */
            <div className="user-menu-wrap">
              <button
                className="luxury-action-btn user-btn"
                aria-label="Account"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className="navbar-avatar" />
                ) : (
                  <User size={18} />
                )}
              </button>

              {userMenuOpen && (
                <div className="user-dropdown luxury-dropdown">
                  <p className="user-dropdown-name">{user.name}</p>
                  <Link to="/account" onClick={() => setUserMenuOpen(false)}>My Account</Link>
                  <Link to="/account/orders" onClick={() => setUserMenuOpen(false)}>Orders</Link>
                  <Link to="/account/wishlist" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); toastSuccess('Signed out', 'Signed out successfully.'); }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Shopping Cart Button with Shake/Pop Microinteraction */}
          <Link
            to="/cart"
            className={`luxury-cart-btn liquid-btn-effect ${cartBumping ? 'cart-bump-anim' : ''}`}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            <span className="cart-text">Cart</span>
            {cartCount > 0 && (
              <span className={`luxury-cart-badge ${cartBumping ? 'badge-pop-anim' : ''}`}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            className="luxury-action-btn mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>
    </header>
  );
}
