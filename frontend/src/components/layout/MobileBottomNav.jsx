import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Flame, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

export default function MobileBottomNav({ onOpenCart, onOpenWishlist, onOpenProfile }) {
  const { cartCount, wishlist = [] } = useCart();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useState('home');
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  // Sync active tab with route location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') {
      setActiveTabId('home');
    } else if (path.startsWith('/shop') || path.startsWith('/categories')) {
      setActiveTabId('trending');
    } else if (path === '/account/wishlist') {
      setActiveTabId('wishlist');
    } else if (path === '/cart') {
      setActiveTabId('cart');
    } else if (path.startsWith('/account') || path.startsWith('/admin')) {
      setActiveTabId('account');
    }
  }, [location.pathname]);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      handleClick: () => {
        setActiveTabId('home');
        navigate('/');
      }
    },
    {
      id: 'trending',
      label: 'Shop',
      icon: Flame,
      handleClick: () => {
        setActiveTabId('trending');
        navigate('/shop');
      }
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount > 0,
      badgeDot: true,
      handleClick: () => {
        setActiveTabId('wishlist');
        if (onOpenWishlist) onOpenWishlist();
        else navigate('/account/wishlist');
      }
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0,
      badgeText: cartCount,
      handleClick: () => {
        setActiveTabId('cart');
        if (onOpenCart) onOpenCart();
        else navigate('/cart');
      }
    },
    {
      id: 'account',
      label: 'Profile',
      icon: User,
      handleClick: () => {
        setActiveTabId('account');
        if (onOpenProfile) {
          onOpenProfile();
        } else if (isAuthenticated) {
          navigate('/account/settings');
        } else {
          if (typeof setShowLoginModal === 'function') {
            setShowLoginModal('login');
          } else {
            navigate('/login');
          }
        }
      }
    }
  ];

  const activeIndex = navItems.findIndex((item) => item.id === activeTabId);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <nav className="white-mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="white-nav-island-bar">
        
        {/* Sliding Black Capsule Indicator */}
        <div 
          className="sliding-black-capsule"
          style={{ transform: `translateX(calc(${safeActiveIndex} * 100%))` }}
        />

        {/* Navigation Tabs List */}
        <div className="white-nav-tabs-grid">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTabId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`white-nav-tab-btn ${isActive ? 'is-active-tab' : ''}`}
                onClick={item.handleClick}
                aria-label={item.label}
              >
                <div className="tab-btn-content">
                  <Icon size={19} className="nav-tab-glyph" />
                  <span className="nav-tab-label">{item.label}</span>

                  {item.badge && !isActive && (
                    <span className={`tab-counter-badge ${item.badgeDot ? 'dot' : ''}`}>
                      {item.badgeText || ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
