import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, Grid, Sparkles, Heart, ShoppingBag, Info, User, LogIn, LogOut, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './MobileNavDrawer.css';

export default function MobileNavDrawer({
  isOpen,
  onClose,
  onSelectCategory,
  onScrollToCatalog,
  onScrollToAbout
}) {
  const { user, logout, setShowLoginModal } = useAuth();
  const { cartCount, wishlist = [] } = useCart();
  const navigate = useNavigate();
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

  const handleAnimatedClose = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      if (typeof callback === 'function') callback();
    }, 280);
  };

  const handleHomeClick = () => {
    handleAnimatedClose(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleCatalogClick = (category = 'all') => {
    handleAnimatedClose(() => {
      if (onSelectCategory) onSelectCategory(category);
      if (onScrollToCatalog) onScrollToCatalog();
    });
  };

  const handleAboutClick = () => {
    handleAnimatedClose(() => {
      if (onScrollToAbout) onScrollToAbout();
    });
  };

  const handleAuthClick = () => {
    handleAnimatedClose(() => {
      if (typeof setShowLoginModal === 'function') {
        setShowLoginModal('login');
      }
    });
  };

  const drawerContent = (
    <div
      className={`mobile-nav-drawer-overlay ${isClosing ? 'drawer-overlay-out' : 'drawer-overlay-in'}`}
      onClick={() => handleAnimatedClose()}
    >
      <div
        className={`mobile-nav-drawer-panel ${isClosing ? 'drawer-slide-out' : 'drawer-slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="drawer-header-bar">
          <div className="drawer-brand-emblem">
            <span style={{ fontSize: '1.4rem' }}>🌿</span>
            <div className="drawer-brand-text">
              <strong>AAAN CART</strong>
              <span>3D Wall Art &amp; Decals</span>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => handleAnimatedClose()}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Account / Sign In Card in Drawer */}
        <div className="drawer-user-card">
          {user ? (
            <div className="drawer-user-logged">
              <div className="drawer-avatar">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" />
                ) : (
                  <User size={20} color="#10B981" />
                )}
              </div>
              <div className="drawer-user-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button
                className="drawer-logout-icon-btn"
                onClick={() => {
                  handleAnimatedClose(() => {
                    logout();
                  });
                }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="drawer-signin-btn" onClick={handleAuthClick}>
              <LogIn size={18} />
              <div className="drawer-signin-text">
                <strong>Sign In / Register</strong>
                <span>Access your saved wishlist &amp; orders</span>
              </div>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Navigation Links & Categories */}
        <div className="drawer-nav-sections">
          
          <div className="drawer-nav-group">
            <span className="drawer-group-title">EXPLORE STORE</span>
            
            <button className="drawer-nav-link" onClick={handleHomeClick}>
              <div className="drawer-link-left">
                <Home size={18} />
                <span>Home</span>
              </div>
              <ChevronRight size={14} color="#94A3B8" />
            </button>

            <button className="drawer-nav-link highlight" onClick={() => handleCatalogClick('all')}>
              <div className="drawer-link-left">
                <Grid size={18} color="#10B981" />
                <span>All 3D Stickers</span>
              </div>
              <span className="drawer-hot-badge">Popular</span>
            </button>

            <button className="drawer-nav-link" onClick={() => handleCatalogClick('wall-niches')}>
              <div className="drawer-link-left">
                <Sparkles size={18} />
                <span>3D Wall Niches (Spotlight)</span>
              </div>
              <ChevronRight size={14} color="#94A3B8" />
            </button>

            <button className="drawer-nav-link" onClick={() => handleCatalogClick('butterflies')}>
              <div className="drawer-link-left">
                <span>🦋</span>
                <span>3D Butterflies Sets</span>
              </div>
              <ChevronRight size={14} color="#94A3B8" />
            </button>

            <button className="drawer-nav-link" onClick={() => handleCatalogClick('plants')}>
              <div className="drawer-link-left">
                <span>🌿</span>
                <span>Botanical Plant Decals</span>
              </div>
              <ChevronRight size={14} color="#94A3B8" />
            </button>
          </div>

          <div className="drawer-nav-group">
            <span className="drawer-group-title">INFORMATION</span>
            
            <button className="drawer-nav-link" onClick={handleAboutClick}>
              <div className="drawer-link-left">
                <Info size={18} />
                <span>About AAAN Cart</span>
              </div>
              <ChevronRight size={14} color="#94A3B8" />
            </button>
          </div>

        </div>

        {/* Bottom Quick Actions: Wishlist & Cart */}
        <div className="drawer-bottom-shortcuts">
          <button
            className="drawer-shortcut-card"
            onClick={() => {
              handleAnimatedClose(() => {
                navigate('/account/wishlist');
              });
            }}
          >
            <Heart size={18} color="#EF4444" />
            <span>Wishlist ({wishlistCount})</span>
          </button>
          <button
            className="drawer-shortcut-card"
            onClick={() => {
              handleAnimatedClose(() => {
                navigate('/cart');
              });
            }}
          >
            <ShoppingBag size={18} color="#10B981" />
            <span>Cart ({cartCount})</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(drawerContent, document.body)
    : drawerContent;
}
