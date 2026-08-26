import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Menu,
  User,
  Search,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { fetchProducts, fetchCategories, formatPrice, getProductPrice, addToWishlist, removeFromWishlist } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import MobileNavDrawer from '../../components/layout/MobileNavDrawer';
import { toastCart, toastWishlist } from '../../utils/toast.js';
import './ShopCatalogPage.css';

// Rich fallback products matching AAAN Cart 3D Wall Decor
const DEFAULT_CATALOG_PRODUCTS = [
  {
    _id: 'def-1',
    slug: 'botanical-monstera-3d-wall-niche',
    name: 'Botanical Monstera 3D Wall Niche',
    price: 499,
    originalPrice: 899,
    discountPercent: 44,
    rating: 4.9,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    category: { name: 'Botanical Plants', slug: 'botanical' }
  },
  {
    _id: 'def-2',
    slug: 'acrylic-mirror-arch-niche',
    name: 'Acrylic Mirror Arch Niche',
    price: 599,
    originalPrice: 1099,
    discountPercent: 45,
    rating: 4.8,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=80',
    category: { name: 'Wall Niches', slug: 'niches' }
  },
  {
    _id: 'def-3',
    slug: '3d-metallic-butterfly-set-12pcs',
    name: '3D Metallic Butterfly Set (12 Pcs)',
    price: 349,
    originalPrice: 699,
    discountPercent: 50,
    rating: 5.0,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=80',
    category: { name: 'Butterflies', slug: 'butterflies' }
  },
  {
    _id: 'def-4',
    slug: 'emerald-leaf-shelf-decal',
    name: 'Emerald Leaf Shelf Decal',
    price: 449,
    originalPrice: 799,
    discountPercent: 43,
    rating: 4.7,
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&auto=format&fit=crop&q=80',
    category: { name: 'Botanical Plants', slug: 'botanical' }
  },
  {
    _id: 'def-5',
    slug: 'modern-geometric-3d-hexagon-panels',
    name: 'Geometric 3D Hexagon Decal',
    price: 649,
    originalPrice: 1199,
    discountPercent: 45,
    rating: 4.9,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&auto=format&fit=crop&q=80',
    category: { name: 'Geometric', slug: 'geometric' }
  },
  {
    _id: 'def-6',
    slug: 'golden-sunburst-acrylic-wall-art',
    name: 'Golden Sunburst Acrylic Wall Art',
    price: 799,
    originalPrice: 1499,
    discountPercent: 46,
    rating: 4.9,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
    category: { name: 'Wall Niches', slug: 'niches' }
  }
];

export default function ShopCatalogPage() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get('category') || 'all';

  const navigate = useNavigate();
  const { cartItems, addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user, isAuthenticated, setShowLoginModal } = useAuth();

  const [products, setProducts] = useState(DEFAULT_CATALOG_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchProducts(), fetchCategories()])
      .then(([prodsData, catsData]) => {
        if (!isMounted) return;
        if (Array.isArray(prodsData) && prodsData.length > 0) {
          setProducts(prodsData);
        }
        if (Array.isArray(catsData) && catsData.length > 0) {
          setCategories(catsData);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_CATALOG_PRODUCTS on error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWishlistClick = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      if (typeof setShowLoginModal === 'function') setShowLoginModal('login');
      else navigate('/login');
      return;
    }
    const wished = isInWishlist(product._id);
    toggleWishlist(product);
    toastWishlist(!wished);
    try {
      if (wished) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch {
      toggleWishlist(product);
    }
  };

  const handleAddToCartClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toastCart(product.name, null);
  };

  // Filter products by category & search query
  const filteredProducts = products.filter((item) => {
    if (selectedCategory !== 'all') {
      const matchCat =
        item.category?.slug === selectedCategory ||
        item.category?._id === selectedCategory ||
        item.category === selectedCategory ||
        item.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }

    return true;
  });

  return (
    <>
      <Helmet>
        <title>Store — 3D Wall Stickers &amp; Botanical Decals | AAAN Cart</title>
        <meta
          name="description"
          content="Explore all 3D Wall Stickers, Acrylic Niches, and Botanical Plant Decals with fast 24h dispatch."
        />
      </Helmet>

      {/* Mobile Drawer Sidebar */}
      <MobileNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSupport={() => window.dispatchEvent(new CustomEvent('open-ai-chatbot'))}
      />

      <div className="kicksy-shop-page-root">
        
        {/* =========================================================
            1. TOP APP BAR (☰  AAAN Cart  👤)
            ========================================================= */}
        <div className="kicksy-top-app-bar">
          <button
            className="kicksy-bar-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} color="#0F172A" />
          </button>

          <Link to="/" className="kicksy-bar-brand">
            <span className="brand-emblem-leaf">🌿</span>
            <span className="brand-title-text">AAAN Cart</span>
          </Link>

          <button
            className="kicksy-bar-btn"
            onClick={() => {
              if (isAuthenticated) navigate('/account/settings');
              else if (typeof setShowLoginModal === 'function') setShowLoginModal('login');
              else navigate('/login');
            }}
            aria-label="Profile"
          >
            <User size={20} color="#0F172A" />
          </button>
        </div>

        {/* =========================================================
            2. "STORE" SEARCH & CART HEADER
            ========================================================= */}
        <div className="kicksy-store-header-section">
          <h1 className="kicksy-store-heading">Store</h1>

          <div className="kicksy-search-cart-row">
            {/* Search Pill Input */}
            <div className="kicksy-search-pill-box">
              <Search size={18} className="search-pill-icon" />
              <input
                type="text"
                placeholder="Search 3D stickers, niches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Floating Shopping Cart Basket Icon */}
            <button
              className="kicksy-cart-bubble-btn"
              onClick={() => navigate('/cart')}
              aria-label="View Cart"
            >
              <ShoppingCart size={22} color="#0F172A" />
              {cartCount > 0 && (
                <span className="kicksy-cart-badge">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            3. CATEGORY FILTER CHIPS (Scrollable)
            ========================================================= */}
        <div className="kicksy-category-chips-row">
          <button
            className={`kicksy-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Designs
          </button>
          <button
            className={`kicksy-chip ${selectedCategory === 'botanical' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('botanical')}
          >
            🌿 Botanical Plants
          </button>
          <button
            className={`kicksy-chip ${selectedCategory === 'niches' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('niches')}
          >
            🏛️ 3D Wall Niches
          </button>
          <button
            className={`kicksy-chip ${selectedCategory === 'butterflies' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('butterflies')}
          >
            🦋 Butterflies
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id || cat.slug}
              className={`kicksy-chip ${selectedCategory === (cat.slug || cat._id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug || cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* =========================================================
            4. "NEW ARRIVALS" TITLE BAR
            ========================================================= */}
        <div className="kicksy-section-title-bar">
          <h2 className="section-main-title">
            {selectedCategory === 'all' ? 'New Arrivals' : 'Selected Category'}
          </h2>
          <button
            className="view-all-link-btn"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            View All &rsaquo;
          </button>
        </div>

        {/* =========================================================
            5. 2-COLUMN PRODUCT CARDS GRID (Matches Mockup 1:1)
            ========================================================= */}
        <div className="kicksy-products-grid">
          {filteredProducts.map((product) => {
            const wished = isInWishlist(product._id);
            const price = getProductPrice(product);

            return (
              <div
                key={product._id || product.slug}
                className="kicksy-product-card"
                onClick={() => navigate(`/product/${product.slug || product._id}`)}
                role="button"
                tabIndex={0}
              >
                
                {/* Top-Left Floating Cart Icon Button */}
                <button
                  className="card-top-cart-btn"
                  onClick={(e) => handleAddToCartClick(e, product)}
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={15} color="#475569" />
                </button>

                {/* Centered Product Image */}
                <div className="card-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-product-img"
                    loading="lazy"
                  />
                </div>

                {/* Product Title */}
                <h3 className="card-product-title">{product.name}</h3>

                {/* Bottom Row: Price & Heart Wishlist Button */}
                <div className="card-bottom-row">
                  <span className="card-price-text">{formatPrice(price)}</span>

                  <button
                    className={`card-heart-btn ${wished ? 'is-wished' : ''}`}
                    onClick={(e) => handleWishlistClick(e, product)}
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={17}
                      color={wished ? '#EF4444' : '#64748B'}
                      fill={wished ? '#EF4444' : 'none'}
                    />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
