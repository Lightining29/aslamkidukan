import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home, LayoutDashboard, Heart, User, Settings, MessageSquare, MapPin, Mail, Globe, Twitter, Facebook, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './MobileNavDrawer.css';

export default function MobileNavDrawer({
  isOpen,
  onClose,
  onOpenSupport
}) {
  const { user, isAdmin, logout, setShowLoginModal } = useAuth();
  const { wishlist = [] } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const userIsAdmin = isAdmin || user?.role === 'admin';

  const handleAnimatedClose = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      if (typeof callback === 'function') callback();
    }, 280);
  };

  const handleNavClick = (path) => {
    handleAnimatedClose(() => {
      navigate(path);
    });
  };

  const handleAuthClick = () => {
    handleAnimatedClose(() => {
      if (typeof setShowLoginModal === 'function') {
        setShowLoginModal('login');
      }
    });
  };

  const handleSupportClick = () => {
    handleAnimatedClose(() => {
      if (onOpenSupport) onOpenSupport();
    });
  };

  // Determine active tab
  const isHome = location.pathname === '/' || location.pathname === '';
  const isDashboard = location.pathname === '/account' || location.pathname.startsWith('/admin');
  const isWishlist = location.pathname === '/account/wishlist';
  const isSettings = location.pathname === '/account/settings';

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const userPhoto = user?.photoUrl || defaultAvatar;
  const userName = user?.name || 'Emma Rue';
  const userCity = user?.city || user?.shippingAddress?.city || 'New Delhi, India';
  const userEmail = user?.email || 'customer@aaancart.com';
  const userBio = userIsAdmin
    ? 'Verified Store Admin & Catalog Dispatcher'
    : (user?.bio || '3D Wall Art & Botanical Decal Collector');

  const drawerContent = (
    <div
      className={`mobile-nav-drawer-overlay ${isClosing ? 'drawer-overlay-out' : 'drawer-overlay-in'}`}
      onClick={() => handleAnimatedClose()}
    >
      <div
        className={`mobile-nav-drawer-panel ${isClosing ? 'drawer-slide-out' : 'drawer-slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Close Button */}
        <div className="drawer-top-close-bar">
          <button
            className="drawer-close-btn"
            onClick={() => handleAnimatedClose()}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card (Matches User Mockup Exactly) */}
        <div className="drawer-profile-hero-card">
          <div className="drawer-profile-avatar-box">
            <img
              src={userPhoto}
              alt={userName}
              className="drawer-profile-img"
            />
          </div>

          <div className="drawer-profile-details">
            <h2 className="drawer-user-name">{userName}</h2>
            
            <div className="drawer-meta-line">
              <MapPin size={13} className="drawer-meta-icon" />
              <span>{userCity}</span>
            </div>

            <div className="drawer-meta-line">
              <Mail size={13} className="drawer-meta-icon" />
              <span>{userEmail}</span>
            </div>

            <p className="drawer-user-bio">{userBio}</p>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="drawer-section-divider" />

        {/* Navigation Tabs List (Lilac / Purple Accent Pill Style) */}
        <div className="drawer-tabs-list">
          
          <button
            className={`drawer-tab-pill-btn ${isHome ? 'is-active' : ''}`}
            onClick={() => handleNavClick('/')}
          >
            <Home size={18} className="tab-pill-icon" />
            <span className="tab-pill-label">Home</span>
          </button>

          <button
            className={`drawer-tab-pill-btn ${isDashboard ? 'is-active' : ''}`}
            onClick={() => handleNavClick(userIsAdmin ? '/admin' : '/account')}
          >
            <LayoutDashboard size={18} className="tab-pill-icon" />
            <span className="tab-pill-label">{userIsAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
          </button>

          <button
            className={`drawer-tab-pill-btn ${isWishlist ? 'is-active' : ''}`}
            onClick={() => handleNavClick('/account/wishlist')}
          >
            <Heart size={18} className="tab-pill-icon" />
            <span className="tab-pill-label">Likes &amp; Wishlist</span>
            {wishlistCount > 0 && (
              <span className="tab-pill-counter-badge">{wishlistCount}</span>
            )}
          </button>

          <button
            className={`drawer-tab-pill-btn ${isSettings ? 'is-active' : ''}`}
            onClick={() => handleNavClick('/account/settings')}
          >
            <User size={18} className="tab-pill-icon" />
            <span className="tab-pill-label">Profile</span>
          </button>

          <button
            className="drawer-tab-pill-btn"
            onClick={() => handleNavClick(userIsAdmin ? '/admin' : '/account/settings')}
          >
            <Settings size={18} className="tab-pill-icon" />
            <span className="tab-pill-label">Settings</span>
          </button>

          <button
            className="drawer-tab-pill-btn"
            onClick={handleSupportClick}
          >
            <MessageSquare size={18} className="tab-pill-icon" />
            <span className="tab-pill-label">Messages &amp; Support</span>
          </button>

        </div>

        {/* Auth Action (Sign In or Sign Out) */}
        <div className="drawer-auth-row">
          {user ? (
            <button
              className="drawer-logout-action-btn"
              onClick={() => {
                handleAnimatedClose(() => {
                  logout();
                });
              }}
            >
              <LogOut size={16} />
              <span>Sign Out Account</span>
            </button>
          ) : (
            <button className="drawer-login-action-btn" onClick={handleAuthClick}>
              <LogIn size={16} />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>

        {/* Bottom Social Links Capsule Pill (Matches Mockup) */}
        <div className="drawer-bottom-social-card">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="drawer-social-icon-btn"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="drawer-social-icon-btn"
            aria-label="Facebook"
          >
            <Facebook size={18} />
          </a>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/');
            }}
            className="drawer-social-icon-btn"
            aria-label="Store Website"
          >
            <Globe size={18} />
          </a>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(drawerContent, document.body)
    : drawerContent;
}
