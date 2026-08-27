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

const siteTitle = 'AAAN Cart — Luxury Home Decor & Modern Wall Art';
const siteDescription = 'Transform your living spaces with handcrafted home decor, luxury 3D wall art, architectural accents, and aesthetic decor with free delivery across India.';

export default function Home() {
  const { cartItems = [], cartCount, cartTotal, addToCart, isInWishlist, toggleWishlist } = useCart();
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
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
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        setProducts([]);
      })
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
      {products.length > 0 && (
        <DesktopHeroShowcase
          onExploreClick={handleExploreClick}
          onOpenModal={handleOpenProductModal}
          featuredSticker={products[0]}
        />
      )}

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

      {/* Main Products Catalog Section (Responsive 4-Col Desktop / 2-Col Mobile) */}
      <section className="catalog-main-section reveal-on-scroll" id="products-catalog-section">
        <div className="container catalog-container">
          
          <div className="catalog-header-bar">
            <div>
              <span className="catalog-eyebrow">
                <Sparkles size={13} /> {searchQuery ? 'SEARCH RESULTS' : 'CURATED 3D WALL ART'}
              </span>
              <h2 className="catalog-title">
                {searchQuery ? `Results for "${searchQuery}"` : 'Curated Luxury Home Decor'}
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
              <p>{searchQuery ? `No decor items found matching "${searchQuery}".` : 'No decor products found in this category.'}</p>
              <button
                className="reset-search-btn liquid-btn-effect"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                View All Home Decor
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modern Home Decor Feature Showcase Card */}
      <section className="container niche-spotlight-feature-section reveal-on-scroll">
        <div className="niche-spotlight-card">
          <div className="niche-spotlight-text">
            <span className="niche-spotlight-badge">🏡 ARCHITECTURAL HOME DECOR</span>
            <h3 className="niche-spotlight-title">The Art of Modern Living Accents</h3>
            <p className="niche-spotlight-desc">
              Every home decor accent is designed with precision micro-textures, rich ambient depth, and refined finishes that seamlessly enhance your living room, bedroom, and dining walls. Elevate your space with effortless designer luxury!
            </p>
            <div className="niche-spotlight-chips">
              <span className="spotlight-chip">✓ Handcrafted Luxury Finishes</span>
              <span className="spotlight-chip">✓ Durable &amp; Wipe-Clean</span>
              <span className="spotlight-chip">✓ Seamless Room Transformation</span>
            </div>
          </div>
          <div className="niche-spotlight-img-wrap">
            <img
              src="/stickers/niche_flowers_3d_1787582996187.jpg"
              alt="Luxury Home Decor Piece"
              className="niche-spotlight-img"
            />
          </div>
        </div>
      </section>

      {/* About AAAN Cart Home Decor Section */}
      <section className="container about-3d-section reveal-on-scroll" id="about">
        <div className="about-3d-card">
          <div className="about-3d-content">
            <span className="about-eyebrow">🏡 ABOUT AAAN CART</span>
            <h3 className="about-title">Crafting Aesthetic Living Spaces</h3>
            <p className="about-desc">
              At <strong>AAAN Cart</strong>, we curate exquisite home decor, architectural 3D wall art, and modern accents designed to turn any living space into a designer masterpiece. Each piece is crafted with premium materials to provide timeless elegance and modern aesthetic charm.
            </p>
            <div className="about-stats-grid">
              <div className="about-stat">
                <strong>50,000+</strong>
                <span>Homes Decorated</span>
              </div>
              <div className="about-stat">
                <strong>100%</strong>
                <span>Quality Inspected</span>
              </div>
              <div className="about-stat">
                <strong>4.95 ★</strong>
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
              <strong>Free Express Delivery</strong>
              <span>Fast doorstep dispatch across India</span>
            </div>
          </div>

          <div className="trust-cell-desktop">
            <div className="trust-icon-box"><ShieldCheck size={22} color="#6366F1" /></div>
            <div>
              <strong>100% Quality Assured</strong>
              <span>Handpicked materials &amp; premium finishes</span>
            </div>
          </div>

          <div className="trust-cell-desktop">
            <div className="trust-icon-box"><RotateCcw size={22} color="#F59E0B" /></div>
            <div>
              <strong>Easy 7-Day Replacement</strong>
              <span>Hassle-free customer satisfaction policy</span>
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
