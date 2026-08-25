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

  const isHome = location.pathname === '/' || location.pathname === '';
  const isShop = location.pathname.startsWith('/shop') || location.pathname.startsWith('/categories');
  const isWishlist = location.pathname === '/account/wishlist';
  const isCart = location.pathname === '/cart';
  const isAccount = location.pathname.startsWith('/account') && !isWishlist;
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  // Determine active index (0: Home, 1: Shop/Trending, 2: Wishlist, 3: Cart, 4: Account)
  let activeIndex = 0;
  if (isShop) activeIndex = 1;
  else if (isWishlist) activeIndex = 2;
  else if (isCart) activeIndex = 3;
  else if (isAccount) activeIndex = 4;

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

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => navigate('/')
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: Flame,
      action: () => navigate('/shop')
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount > 0,
      badgeDot: true,
      action: () => (onOpenWishlist ? onOpenWishlist() : navigate('/account/wishlist'))
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0,
      badgeText: cartCount,
      action: () => (onOpenCart ? onOpenCart() : navigate('/cart'))
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      action: handleAccountClick
    }
  ];

  return (
    <nav className="curved-fluid-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="curved-nav-island-bar">
        
        {/* Sliding Fluid Notch Curve Indicator */}
        <div 
          className="fluid-sliding-notch"
          style={{ transform: `translateX(calc(${activeIndex} * (100% / ${navItems.length})))` }}
        >
          {/* Fluid Concave Wings Cutout */}
          <div className="notch-wing wing-left" />
          
          {/* Elevated Floating Active Circle Bubble */}
          <div className="notch-elevated-circle">
            <div className="notch-circle-glow" />
          </div>
          
          <div className="notch-wing wing-right" />
        </div>

        {/* Navigation Tab Icons List */}
        <div className="curved-nav-tabs-grid">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            return (
              <button
                key={item.id}
                type="button"
                className={`curved-nav-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={item.action}
                aria-label={item.label}
              >
                <div className="tab-icon-holder">
                  <Icon size={20} className="tab-glyph-icon" />
                  
                  {item.badge && !isActive && (
                    <span className={`tab-badge-bubble ${item.badgeDot ? 'dot' : ''}`}>
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
