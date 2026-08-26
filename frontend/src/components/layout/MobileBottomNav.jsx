import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Flame, Heart, Headphones, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

export default function MobileBottomNav({
  onOpenWishlist,
  onOpenProfile
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist } = useCart();
  const wishlistCount = wishlist?.length || 0;
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const [activeTabId, setActiveTabId] = useState('home');

  // Sync active tab with current URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') {
      setActiveTabId('home');
    } else if (path.startsWith('/shop') || path.startsWith('/categories') || path.startsWith('/products')) {
      setActiveTabId('trending');
    } else if (path === '/account/wishlist') {
      setActiveTabId('wishlist');
    } else if (path === '/contact') {
      setActiveTabId('contact');
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
        if (location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate('/');
        }
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
      id: 'contact',
      label: 'Contact',
      icon: Headphones,
      handleClick: () => {
        setActiveTabId('contact');
        navigate('/contact');
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
            const IconComponent = item.icon;
            const isActive = activeTabId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`white-nav-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={item.handleClick}
                aria-label={item.label}
                aria-pressed={isActive}
              >
                <div className="white-icon-badge-wrap">
                  <IconComponent size={21} className="white-nav-icon" />

                  {/* Red/Green Badges */}
                  {item.badge && item.badgeText !== undefined && (
                    <span className="white-nav-num-badge">{item.badgeText}</span>
                  )}
                  {item.badge && item.badgeDot && (
                    <span className="white-nav-dot-badge" />
                  )}
                </div>

                <span className="white-nav-label-text">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
