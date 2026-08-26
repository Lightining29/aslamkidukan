import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search, Heart, ShoppingBag, ArrowRight, Star,
  ShieldCheck, RotateCcw, Headphones, Sparkles, Flame,
  Package, Plus, Check, Truck, Zap, Percent, ChevronRight, Award,
  SlidersHorizontal, LayoutGrid, Layers, Eye
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts, formatPrice, getProductPrice, addToWishlist, removeFromWishlist } from '../../api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import MobileAppHeader from '../../components/layout/MobileAppHeader';
import MobileHeroBanner from '../../components/shop/MobileHeroBanner';
import DesktopHeroShowcase from '../../components/shop/DesktopHeroShowcase';
import MovingStickersMarquee from '../../components/shop/MovingStickersMarquee';
import Interactive3DStudio from '../../components/shop/Interactive3DStudio';
import CategoryPills from '../../components/shop/CategoryPills';
import StickerProductCard from '../../components/shop/StickerProductCard';
import Interactive3DDetailModal from '../../components/product/Interactive3DDetailModal';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import MobileNavDrawer from '../../components/layout/MobileNavDrawer';
import PageTransitionCutout from '../../components/common/PageTransitionCutout';
import LiquidMotionCanvas from '../../components/common/LiquidMotionCanvas';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { STICKER_PRODUCTS, STICKER_CATEGORIES } from '../../data/stickersCatalog';
import { semanticSearchProducts } from '../../utils/semanticSearch';
import '../../styles/animations.css';
import '../../styles/microinteractions.css';
import '../../styles/pageTransitions.css';
import './Home.css';

const siteTitle = 'AAAN Cart — 3D Plant & Butterfly Wall Stickers Store';
const siteDescription = 'Shop hyper-realistic 3D optical illusion wall niche stickers, 3D botanical plant decals, and shimmering 3D butterfly wall sets with free shipping on AAAN Cart.';

export default function Home() {
  const { cartItems = [], cartCount, cartTotal, addToCart, isInWishlist, toggleWishlist } = useCart();
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState(STICKER_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize smooth scroll reveal on content sections
  useScrollReveal('.reveal-on-scroll', 0.1);

  // Fetch backend products if available
  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const combined = [
            ...data,
            ...STICKER_PRODUCTS.filter(s => !data.some(p => p._id === s._id || p.slug === s.slug))
          ];
          setProducts(combined);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Smooth scroll to targeted section when arriving from other pages
  useEffect(() => {
    const section = searchParams.get('section') || (window.location.hash ? window.location.hash.replace('#', '') : null);
    if (section) {
      const timer = setTimeout(() => {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchParams, window.location.hash]);

  // Filter products by category
  const baseCategoryFiltered = selectedCategory === 'all'
    ? products
    : products.filter(p => {
        const catSlug = p.categorySlug || (typeof p.category === 'object' ? p.category?.slug : p.category) || '';
        const catName = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
        return catSlug.toLowerCase() === selectedCategory.toLowerCase() ||
               catName.toLowerCase().includes(selectedCategory.toLowerCase());
      });

  // Semantic search filter
  const filteredProducts = searchQuery.trim()
    ? semanticSearchProducts(baseCategoryFiltered, searchQuery)
    : baseCategoryFiltered;

  // Curated subsets
  const nicheStickers = products.filter(p => p.categorySlug === 'niche');
  const butterflyStickers = products.filter(p => p.categorySlug === 'butterflies');
  const plantStickers = products.filter(p => p.categorySlug === 'plants' || p.categorySlug === 'succulents');

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const el = document.getElementById('products-catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    const el = document.getElementById('products-catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenProductModal = (product) => {
    setActiveModalProduct(product);
  };

  const handleCloseProductModal = () => {
    setActiveModalProduct(null);
  };

  const handleBuyNow = () => {
    navigate('/checkout');
  };

  return (
    <div className="stickers-shop-shell page-slide-zoom-enter">
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
      </Helmet>

      {/* Luxury Cutout Page Reveal Transition */}
      <PageTransitionCutout />

      {/* Ambient Liquid Motion Floating Layer */}
      <LiquidMotionCanvas />

      {/* Desktop Main Header Navbar */}
      <div className="desktop-navbar-wrapper">
        <Navbar />
      </div>

      {/* Mobile App Header (Visible on Mobile only) */}
      <div className="mobile-header-only-wrapper">
        <MobileAppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenMenu={() => setMobileDrawerOpen(true)}
        />
      </div>

      {/* Desktop Full-Width Luxury Hero Showcase */}
      <DesktopHeroShowcase
        onExploreClick={handleExploreClick}
        onOpenModal={handleOpenProductModal}
        featuredSticker={STICKER_PRODUCTS[0]}
      />

      {/* Mobile Hero Carousel Banner (Visible on Mobile only) */}
      <div className="mobile-hero-only-wrapper">
        <MobileHeroBanner
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            handleExploreClick();
          }}
        />
      </div>

      {/* Continuous Infinite Moving 3D Sticker Marquee Carousel */}
      <MovingStickersMarquee
        products={products}
        onOpenModal={handleOpenProductModal}
      />

      {/* Interactive 3D Wall Simulator Studio (Desktop Only) */}
      <div className="desktop-only-studio-wrapper">
        <Interactive3DStudio
          onOpenModal={handleOpenProductModal}
        />
      </div>

      {/* Main Products Catalog Section (Responsive 4-Col Desktop / 2-Col Mobile) */}
      <section className="catalog-main-section reveal-on-scroll" id="products-catalog-section">
        <div className="container catalog-container">
          
          <div className="catalog-header-bar">
            <div>
              <span className="catalog-eyebrow">
                <Sparkles size={13} /> {searchQuery ? 'SEARCH RESULTS' : 'CURATED 3D WALL ART'}
              </span>
              <h2 className="catalog-title">
                {searchQuery ? `Results for "${searchQuery}"` : 'All 3D Plants & Butterfly Stickers'}
              </h2>
            </div>

            {/* Desktop / Mobile Category Filter Pills */}
            <div className="catalog-pills-wrap">
              <CategoryPills
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>

          {/* Product Grid with Staggered Transitions */}
          <div className="stickers-responsive-grid">
            {filteredProducts.map((p, idx) => (
              <div key={p._id || p.slug} className={`stagger-${(idx % 8) + 1}`}>
                <StickerProductCard
                  product={p}
                  onOpenModal={handleOpenProductModal}
                />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products-empty-state">
              <p>No 3D stickers found matching "{searchQuery}".</p>
              <button
                className="reset-search-btn liquid-btn-effect"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                View All 3D Stickers
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3D Niche Wall Art Feature Showcase Card */}
      <section className="container niche-spotlight-feature-section reveal-on-scroll">
        <div className="niche-spotlight-card">
          <div className="niche-spotlight-text">
            <span className="niche-spotlight-badge">💡 ARCHITECTURAL 3D DECOR</span>
            <h3 className="niche-spotlight-title">How 3D Optical Illusion Niches Work</h3>
            <p className="niche-spotlight-desc">
              Each decal is printed with 300 DPI micro-gradients simulating a built-in recessed wall cavity and an overhead spotlight beam. It creates authentic 3D shadows and realism without making any holes or construction in your walls!
            </p>
            <div className="niche-spotlight-chips">
              <span className="spotlight-chip">✓ Removable Peel &amp; Stick</span>
              <span className="spotlight-chip">✓ Waterproof &amp; Wipeable</span>
              <span className="spotlight-chip">✓ Safe on Painted Walls</span>
            </div>
          </div>
          <div className="niche-spotlight-img-wrap">
            <img
              src="/stickers/niche_flowers_3d_1787582996187.jpg"
              alt="3D Flower & Butterfly Niche"
              className="niche-spotlight-img"
            />
          </div>
        </div>
      </section>

      {/* About AAAN Cart & 3D Stickers Section */}
      <section className="container about-3d-section reveal-on-scroll" id="about">
        <div className="about-3d-card">
          <div className="about-3d-content">
            <span className="about-eyebrow">🌿 ABOUT AAAN CART</span>
            <h3 className="about-title">Pioneering 3D Optical Illusion Wall Art</h3>
            <p className="about-desc">
              At <strong>AAAN Cart</strong>, we transform everyday rooms into stunning architectural living spaces. Our signature 3D wall niche decals and holographic butterfly sets combine precision micro-embossed printing, simulated ceiling spotlights, and residue-free removable vinyl. Elevate your walls in minutes—no drilling or renovation needed.
            </p>
            <div className="about-stats-grid">
              <div className="about-stat">
                <strong>50,000+</strong>
                <span>Walls Transformed</span>
              </div>
              <div className="about-stat">
                <strong>100%</strong>
                <span>Removable Vinyl</span>
              </div>
              <div className="about-stat">
                <strong>4.9 ★</strong>
                <span>Customer Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="container trust-strip-section reveal-on-scroll">
        <div className="trust-grid-desktop">
          <div className="trust-cell-desktop">
            <div className="trust-icon-box"><Truck size={22} color="#10B981" /></div>
            <div>
              <strong>Free Express Shipping</strong>
              <span>Fast 24-hour dispatch across India</span>
            </div>
          </div>

          <div className="trust-cell-desktop">
            <div className="trust-icon-box"><ShieldCheck size={22} color="#6366F1" /></div>
            <div>
              <strong>100% 3D Depth Guaranteed</strong>
              <span>High definition bubble-free vinyl</span>
            </div>
          </div>

          <div className="trust-cell-desktop">
            <div className="trust-icon-box"><RotateCcw size={22} color="#F59E0B" /></div>
            <div>
              <strong>Easy 7-Day Replacement</strong>
              <span>Hassle-free customer return policy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Main Footer */}
      <div className="desktop-footer-wrapper">
        <Footer />
      </div>

      {/* Interactive 3D Product Details Modal */}
      {activeModalProduct && (
        <Interactive3DDetailModal
          product={activeModalProduct}
          onClose={handleCloseProductModal}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Mobile Slide-out Navigation Drawer Menu */}
      <MobileNavDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectCategory={setSelectedCategory}
        onScrollToCatalog={handleExploreClick}
        onScrollToAbout={() => { const el = document.getElementById('about'); if(el) el.scrollIntoView({behavior:'smooth'}); }}
      />

    </div>
  );
}

export function HomeLayout() {
  return <Home />;
}
