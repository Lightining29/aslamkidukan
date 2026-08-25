import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

export default function MobileBottomNav({ onOpenCart, onOpenWishlist, onOpenProfile }) {
  const { cartCount, wishlist = [] } = useCart();
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' || location.pathname === '';
  const isCart = location.pathname === '/cart';
  const isWishlist = location.pathname === '/account/wishlist';
  const isAccount = location.pathname.startsWith('/account') && !isWishlist;
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  const handleAccountClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else if (isAuthenticated) {
      navigate('/account');
    } else {
      if (typeof setShowLoginModal === 'function') {
        setShowLoginModal('login');
      } else {
        navigate('/login');
      }
    }
  };

  const handleWishlistClick = () => {
    if (onOpenWishlist) {
      onOpenWishlist();
    } else {
      navigate('/account/wishlist');
    }
  };

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      navigate('/cart');
    }
  };

  return (
    <nav className="floating-mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="floating-nav-pill-track">
        
        {/* 1. Home Tab */}
        <button
          className={`floating-nav-item ${isHome ? 'active-capsule' : ''}`}
          onClick={() => navigate('/')}
          aria-label="Home"
        >
          <Home size={18} className="floating-nav-icon home-icon" />
          {isHome && <span className="floating-nav-text">Home</span>}
        </button>

        {/* 2. Cart Tab */}
        <button
          className={`floating-nav-item ${isCart ? 'active-capsule' : ''}`}
          onClick={handleCartClick}
          aria-label="Cart"
        >
          <div className="floating-icon-wrapper">
            <ShoppingBag size={18} className="floating-nav-icon" />
            {cartCount > 0 && !isCart && (
              <span className="floating-pill-badge">{cartCount}</span>
            )}
          </div>
          {isCart && <span className="floating-nav-text">Cart {cartCount > 0 ? `(${cartCount})` : ''}</span>}
        </button>

        {/* 3. Wishlist Tab */}
        <button
          className={`floating-nav-item ${isWishlist ? 'active-capsule' : ''}`}
          onClick={handleWishlistClick}
          aria-label="Wishlist"
        >
          <div className="floating-icon-wrapper">
            <Heart size={18} className="floating-nav-icon" />
            {wishlistCount > 0 && !isWishlist && (
              <span className="floating-pill-badge dot" />
            )}
          </div>
          {isWishlist && <span className="floating-nav-text">Wishlist</span>}
        </button>

        {/* 4. Account Profile Tab */}
        <button
          className={`floating-nav-item ${isAccount ? 'active-capsule' : ''}`}
          onClick={handleAccountClick}
          aria-label="Account"
        >
          <User size={18} className="floating-nav-icon" />
          {isAccount && <span className="floating-nav-text">Profile</span>}
        </button>

      </div>
    </nav>
  );
}
