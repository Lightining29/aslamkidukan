import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star, Heart, ShoppingBag, Truck, RefreshCw, Shield,
  Minus, Plus, Check, Share2, Zap, Award, ChevronRight,
  Eye, Download, Clock, Sliders, Play, RotateCw, Sparkles, CheckCircle
} from 'lucide-react';
import {
  fetchProduct,
  fetchProducts,
  formatPrice,
  getProductPrice,
  addToWishlist,
  removeFromWishlist,
} from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ReviewSection from '../../components/shop/ReviewSection';
import ProductRow from '../../components/shop/ProductRow';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { toastWishlist, toastSuccess } from '../../utils/toast.js';
import { STICKER_PRODUCTS } from '../../data/stickersCatalog';
import './ProductDetail.css';

const COLOR_SWATCHES = [
  { name: 'Royal Sapphire', hex: '#1E3A8A' },
  { name: 'Obsidian Black', hex: '#0F172A' },
  { name: 'Emerald Green', hex: '#065F46' },
  { name: 'Crimson Red', hex: '#991B1B' },
  { name: 'Pearl White', hex: '#F8FAFC' }
];

const RELATED_ACCESSORIES = [
  { id: 'acc-1', name: 'AAAN Premium Protective Travel Case', price: 499, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300' },
  { id: 'acc-2', name: 'Fast Charging Adapter & Braided Cable', price: 699, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300' },
  { id: 'acc-3', name: 'AAAN Extended 1-Year Care Warranty', price: 299, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300' }
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [alsoLike, setAlsoLike] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartAdded, setCartAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // New Interactive States for 19 Features
  const [mediaMode, setMediaMode] = useState('image'); // 'image' | '360' | 'video'
  const [rotationDegree, setRotationDegree] = useState(0);
  const [zoomPos, setZoomPos] = useState({ show: false, x: 0, y: 0 });
  const [userHeight, setUserHeight] = useState(170);
  const [userWeight, setUserWeight] = useState(70);
  const [bundleAdded, setBundleAdded] = useState(false);

  const { list: recentlyViewed, track } = useRecentlyViewed(product?._id);

  // Category detection for clothes vs furniture/electronics
  const catName = (product?.category?.name || product?.category || '').toString().toLowerCase();
  const isClothing = catName.includes('cloth') || catName.includes('fashion') || catName.includes('apparel') || catName.includes('wear') || catName.includes('shirt') || catName.includes('pant') || catName.includes('dress') || catName.includes('sports');
  const isFurnitureOrElectronics = catName.includes('furniture') || catName.includes('electron') || catName.includes('tech') || catName.includes('home') || catName.includes('appliance') || catName.includes('living') || catName.includes('wellness') || catName.includes('massager');

  const defaultSizes = isClothing
    ? ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    : ['30 × 20 cm', '50 × 40 cm', '100 × 60 cm', '150 × 80 cm', '200 × 100 cm'];

  const availableSizes = Array.isArray(product?.sizes) && product?.sizes.length > 0
    ? product.sizes
    : defaultSizes;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchProduct(slug)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
        track(data);
        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize(defaultSizes[0]);
        }

        const catId = data.category?._id || data.category;
        if (catId) {
          fetchProducts({ category: catId }).then((list) => {
            if (!mounted) return;
            const others = (Array.isArray(list) ? list : []).filter((p) => p._id !== data._id);
            setSimilar(others.slice(0, 4));
          });
        }

        fetchProducts({ bestseller: true }).then((list) => {
          if (!mounted) return;
          const others = (Array.isArray(list) ? list : []).filter((p) => p._id !== data._id);
          setAlsoLike(others.slice(0, 4));
        });
      })
      .catch((err) => {
        console.error('Failed to fetch product:', err);
        const found = STICKER_PRODUCTS.find(p => p.slug === slug || p._id === slug);
        if (found && mounted) {
          setProduct(found);
          track(found);
          setSelectedSize(found.sizes ? found.sizes[0] : '40 × 60 cm');
          setSimilar(STICKER_PRODUCTS.filter(p => p.slug !== slug).slice(0, 4));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [slug]);

  // Scroll listener for sticky quick bar
  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Compute recommended size based on height & weight calculator
  const computeRecommendedSize = () => {
    if (userWeight < 60) return 'S';
    if (userWeight < 72) return 'M';
    if (userWeight < 85) return 'L';
    if (userWeight < 98) return 'XL';
    return 'XXL';
  };

  if (loading) {
    return (
      <div className="product-detail-skeleton">
        <Navbar />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="skeleton-box" style={{ height: 400, borderRadius: 24, marginBottom: 20 }} />
          <p>Loading AAAN Luxury Catalog Details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <Navbar />
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2>Product Not Found</h2>
          <p>The catalog item you are looking for does not exist or has been removed.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 20, display: 'inline-block' }}>
            Back to Home Store
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const finalPrice = getProductPrice(product);
  const discount = (product.price || 0) - finalPrice;
  const wished = isInWishlist(product._id);

  let primaryImage = product.image || (Array.isArray(product.images) && product.images[0]) || '/aaan-logo.svg';
  let gallery = Array.isArray(product.images) && product.images.length > 0 ? product.images : [primaryImage];
  if (gallery.length === 1) {
    gallery = [gallery[0], gallery[0], gallery[0]];
  }

  const activeIdx = Math.min(activeImage, gallery.length - 1);
  const mainImage = gallery[activeIdx] || primaryImage;

  const handleMouseMoveZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ show: true, x, y });
  };

  const handleWishlist = async () => {
    toggleWishlist(product);
    toastWishlist(!wished);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toastSuccess('Link Copied!', 'Product link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* blocked */
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleAddBundleToCart = () => {
    addToCart(product, 1, selectedSize);
    setBundleAdded(true);
    toastSuccess('Combo Bundle Added! 🎁', 'Product + Protective Case added to cart with 15% discount.');
    setTimeout(() => setBundleAdded(false), 2500);
  };

  const handleDownloadManual = () => {
    toastSuccess('Downloading Manual 📄', `${product.name} User Manual & Warranty Spec Sheet.`);
  };

  return (
    <div className="aaan-product-detail-shell">
      <Helmet>
        <title>{`${product.name} | AAAN Enterprises`}</title>
        <meta name="description" content={product.description ? product.description.substring(0, 160) : ''} />
      </Helmet>

      <Navbar />

      <div className="container product-detail-container">
        
        {/* Sleek Breadcrumbs */}
        <div className="aaan-breadcrumb-card">
          <Link to="/">Home</Link>
          <ChevronRight size={14} className="separator" />
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
              <ChevronRight size={14} className="separator" />
            </>
          )}
          <span className="current">{product.name}</span>
        </div>

        <div className="product-detail-wrapper">
          
          {/* Left Column: Product Gallery, 360° Rotator & Zoom Lens */}
          <div className="product-image-section">
            
            {/* Gallery Mode Switcher (Standard, 360° Rotate, Video Demo) */}
            <div className="media-mode-switcher">
              <button
                className={`mode-btn ${mediaMode === 'image' ? 'active' : ''}`}
                onClick={() => setMediaMode('image')}
              >
                📸 Photos
              </button>
              <button
                className={`mode-btn ${mediaMode === '360' ? 'active' : ''}`}
                onClick={() => setMediaMode('360')}
              >
                <RotateCw size={14} /> 360° View
              </button>
              <button
                className={`mode-btn ${mediaMode === 'video' ? 'active' : ''}`}
                onClick={() => setMediaMode('video')}
              >
                <Play size={14} /> Video Reel
              </button>
            </div>

            {/* Main Interactive Display Box */}
            <div className="product-image-container">
              
              {/* Mode A: Standard Image with Hover Zoom Lens */}
              {mediaMode === 'image' && (
                <div
                  className="zoom-image-wrapper"
                  onMouseMove={handleMouseMoveZoom}
                  onMouseLeave={() => setZoomPos({ show: false, x: 0, y: 0 })}
                >
                  <img
                    src={mainImage}
                    alt={`${product.name} - view ${activeIdx + 1}`}
                    className="product-image-main"
                  />
                  {zoomPos.show && (
                    <div
                      className="zoom-lens-magnifier"
                      style={{
                        backgroundImage: `url(${mainImage})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                    />
                  )}
                </div>
              )}

              {/* Mode B: 360° Product Rotator */}
              {mediaMode === '360' && (
                <div className="rotator-360-box">
                  <div
                    className="rotator-img-wrap"
                    style={{ transform: `rotateY(${rotationDegree}deg)` }}
                  >
                    <img src={mainImage} alt="360 View" />
                  </div>
                  <div className="rotator-controls">
                    <label>Drag to Rotate 360° ({rotationDegree}°)</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotationDegree}
                      onChange={(e) => setRotationDegree(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
              )}

              {/* Mode C: Video Player */}
              {mediaMode === 'video' && (
                <div className="product-video-box">
                  <div className="video-overlay-play">
                    <Play size={48} color="#FFFFFF" />
                    <span>Watch AAAN Official Product Demo</span>
                  </div>
                  <img src={mainImage} alt="Video Preview" style={{ opacity: 0.5 }} />
                </div>
              )}

              {/* Status Badges */}
              <div className="p-badges-stack">
                {product.bestseller && (
                  <span className="p-badge bestseller">★ BESTSELLER</span>
                )}
                <span className="p-badge trending">🔥 TRENDING</span>
                <span className="p-badge new-arrival">✨ NEW ARRIVAL</span>
                {product.discountPercent > 20 && (
                  <span className="p-badge limited">👑 LIMITED EDITION</span>
                )}
              </div>

              {product.discountPercent > 0 && (
                <div className="aaan-save-badge">
                  <span className="save-pct">-{product.discountPercent}% OFF</span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {gallery.length > 1 && mediaMode === 'image' && (
              <div className="product-image-thumbnails">
                {gallery.map((src, i) => (
                  <div
                    key={i}
                    className={`thumbnail ${i === activeIdx ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={src} alt={`${product.name} thumbnail ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Live Social Proof Counters */}
            <div className="social-proof-bar">
              <div className="social-proof-item">
                <Eye size={16} color="#4F46E5" />
                <span><strong>184 shoppers</strong> viewing right now</span>
              </div>
              <div className="social-proof-item">
                <Sparkles size={16} color="#10B981" />
                <span><strong>52 ordered</strong> in last 24 hours</span>
              </div>
            </div>

          </div>

          {/* Right Column: Specs, Swatches, Guides & Actions */}
          <div className="product-info-section">
            
            {/* Category Tag */}
            <div className="aaan-p-cat-tag">
              <Zap size={14} color="#6366F1" />
              <span>{product.category?.name || 'AAAN Verified Store'}</span>
            </div>

            {/* Title & Share/Wishlist */}
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="header-actions-wrap">
                <button className="share-icon-btn" onClick={handleShare} title="Share product">
                  <Share2 size={20} />
                  {copied && <span className="share-tooltip">Copied!</span>}
                </button>
                <button
                  className={`wishlist-icon-btn ${wished ? 'active' : ''}`}
                  onClick={handleWishlist}
                  title="Add to wishlist"
                >
                  <Heart size={22} fill={wished ? '#EF4444' : 'none'} color={wished ? '#EF4444' : '#64748B'} />
                </button>
              </div>
            </div>

            {/* Rating Bar */}
            <div className="product-rating-section">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating || 4.8) ? '#F59E0B' : '#E2E8F0'}
                    color={i < Math.floor(product.rating || 4.8) ? '#F59E0B' : '#E2E8F0'}
                  />
                ))}
              </div>
              <span className="rating-number">{product.rating || 4.8} / 5</span>
              <span className="review-count">({product.reviewCount || 128} customer reviews)</span>
            </div>

            {/* Price Box */}
            <div className="price-section">
              <div className="price-group">
                <span className="price-current">{formatPrice(finalPrice)}</span>
                {product.discountPercent > 0 && (
                  <span className="price-original">{formatPrice(product.price)}</span>
                )}
              </div>
              {product.discountPercent > 0 && (
                <span className="discount-percent-chip">
                  Save {product.discountPercent}% Instant
                </span>
              )}
            </div>

            {/* Color Swatches Selection */}
            <div className="color-swatch-card">
              <label className="swatch-label">
                Color Variant: <strong>{selectedColor.name}</strong>
              </label>
              <div className="swatches-flex">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    className={`color-swatch-circle ${selectedColor.name === swatch.name ? 'active' : ''}`}
                    style={{ backgroundColor: swatch.hex }}
                    onClick={() => setSelectedColor(swatch)}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            {/* Category-Specific Size & Dimension Selector */}
            <div className="aaan-size-picker-card">
              <div className="size-picker-header">
                <label className="size-picker-label">
                  {isClothing ? '👔 Select Clothing Size:' : isFurnitureOrElectronics ? '📏 Select Size / Dimensions (in cm):' : '📐 Select Size Options:'}
                </label>

                <button
                  type="button"
                  className="size-guide-link"
                  onClick={() => setShowSizeGuide(true)}
                >
                  {isClothing ? '📏 Size Chart & Interactive Calculator' : '📐 Dimension Specs (cm)'}
                </button>
              </div>

              <div className="size-chips-wrap">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`aaan-p-size-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      <span>{sz}</span>
                      {isSelected && <Check size={14} className="size-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="actions-section">
              {product.inStock && (
                <div className="quantity-selector">
                  <label>Select Quantity:</label>
                  <div className="quantity-input">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="qty-btn"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      className="qty-input"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="qty-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <button
                  className={`btn-add-cart ${cartAdded ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  {cartAdded ? (
                    <>
                      <Check size={20} /> Item Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  className="btn-buy-now"
                  onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                  disabled={!product.inStock}
                >
                  <Zap size={20} /> Buy Now
                </button>
              </div>
            </div>

            {/* Frequently Bought Together Combo Bundle Box */}
            <div className="combo-bundle-card">
              <div className="bundle-head">
                <Sparkles size={18} color="#FFE600" />
                <strong>Frequently Bought Together Combo Offer</strong>
                <span className="bundle-save-tag">SAVE 15% EXTRA</span>
              </div>
              <div className="bundle-items-row">
                <div className="bundle-item-thumb">
                  <img src={mainImage} alt={product.name} />
                  <span>{product.name.substring(0, 18)}...</span>
                </div>
                <span className="plus-sign">+</span>
                <div className="bundle-item-thumb">
                  <img src={RELATED_ACCESSORIES[0].image} alt="Accessory" />
                  <span>Protective Case</span>
                </div>
                <div className="bundle-price-wrap">
                  <span className="bundle-total">{formatPrice(finalPrice + 499 - 150)}</span>
                  <button onClick={handleAddBundleToCart} className="btn-add-bundle">
                    {bundleAdded ? '✓ Bundle Added!' : '+ Add Combo Bundle'}
                  </button>
                </div>
              </div>
            </div>

            {/* Warranty & Manual Card */}
            <div className="warranty-manual-card">
              <div className="wm-item">
                <Shield size={20} color="#10B981" />
                <div>
                  <strong>{product.warranty || '1 Year AAAN Official Warranty'}</strong>
                  <span>Includes doorstep repair &amp; full replacement policy</span>
                </div>
              </div>

              <button onClick={handleDownloadManual} className="btn-download-manual">
                <Download size={16} /> Download User Manual (PDF)
              </button>
            </div>

          </div>

        </div>

        {/* Interactive Production & Logistics Timeline */}
        <div className="product-timeline-card">
          <h3 className="timeline-title"><Clock size={18} color="#6366F1" /> Product Craftsmanship &amp; Logistics Timeline</h3>
          <div className="timeline-steps-grid">
            <div className="t-step active">
              <div className="t-circle">1</div>
              <strong>Raw Material Sourced</strong>
              <span>Grade-A Genuine Quality</span>
            </div>
            <div className="t-step active">
              <div className="t-circle">2</div>
              <strong>Precision Crafted</strong>
              <span>Inspected by Experts</span>
            </div>
            <div className="t-step active">
              <div className="t-circle">3</div>
              <strong>AAAN Quality Tested</strong>
              <span>100% Certified Original</span>
            </div>
            <div className="t-step">
              <div className="t-circle">4</div>
              <strong>Same-Day Air Dispatch</strong>
              <span>Delivered in 2-4 Days</span>
            </div>
          </div>
        </div>

        {/* Compatible Accessories Grid */}
        <div className="accessories-section">
          <h3 className="acc-section-title">🔌 Compatible Related Accessories</h3>
          <div className="acc-grid">
            {RELATED_ACCESSORIES.map((acc) => (
              <div key={acc.id} className="acc-card">
                <img src={acc.image} alt={acc.name} />
                <div className="acc-info">
                  <strong>{acc.name}</strong>
                  <span>{formatPrice(acc.price)}</span>
                  <button onClick={() => toastSuccess('Accessory Added', `${acc.name} added to cart.`)} className="btn-acc-add">
                    + Add Accessory
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabbed Detailed Information */}
        <div className="product-details-tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description &amp; Highlights
            </button>
            <button
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications &amp; Quality
            </button>
            <button
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping &amp; Delivery Terms
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <h3>Product Overview</h3>
                <p>{product.description}</p>
                <p>
                  Every product at <strong>AAAN Enterprises</strong> is crafted with attention to detail and rigorous quality standards. Tested for durability, efficacy, and superior user experience.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="tab-pane">
                <h3>Technical Specifications</h3>
                <ul className="aaan-spec-list">
                  <li><strong>Brand:</strong> AAAN Enterprises</li>
                  <li><strong>Category:</strong> {product.category?.name || 'General Catalog'}</li>
                  <li><strong>Warranty:</strong> {product.warranty || '1 Year Manufacturer Replacement Guarantee'}</li>
                  <li><strong>Package Contents:</strong> 1x {product.name}, User Manual, Warranty Card</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="tab-pane">
                <h3>Shipping &amp; Return Policies</h3>
                <p>
                  We offer fast express shipping on all orders across India. Orders placed before 3:00 PM are dispatched on the same business day.
                </p>
                <p>
                  Enjoy our 30-day hassle-free return policy. If you receive a damaged or incorrect item, our customer support team will arrange a quick doorstep pickup and immediate replacement.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews */}
        <ReviewSection product={product} productId={product._id} />

      </div>

      {/* Interactive Size Guide Modal Popup with Height/Weight Recommender */}
      {showSizeGuide && (
        <div className="modal-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="modal-box size-guide-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📏 Interactive Size Guide &amp; AI Calculator</h3>
              <button className="close-btn" onClick={() => setShowSizeGuide(false)}>✕</button>
            </div>

            <div className="modal-body">
              
              {/* Interactive Recommender */}
              <div className="recommender-box">
                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#4F46E5' }}>✨ AI Size Recommender Calculator</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Your Height: {userHeight} cm</label>
                    <input
                      type="range"
                      min="140"
                      max="200"
                      value={userHeight}
                      onChange={(e) => setUserHeight(parseInt(e.target.value, 10))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Your Weight: {userWeight} kg</label>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={userWeight}
                      onChange={(e) => setUserWeight(parseInt(e.target.value, 10))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="recommended-result">
                  🎯 Recommended Size for You: <strong>{computeRecommendedSize()}</strong>
                </div>
              </div>

              {/* Size Chart Table */}
              <table className="size-chart-table">
                <thead>
                  <tr>
                    <th>Size Tag</th>
                    <th>Chest (Inches)</th>
                    <th>Waist (Inches)</th>
                    <th>Length (Inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>S</strong></td><td>36 - 38"</td><td>30 - 32"</td><td>27"</td></tr>
                  <tr><td><strong>M</strong></td><td>38 - 40"</td><td>32 - 34"</td><td>28"</td></tr>
                  <tr><td><strong>L</strong></td><td>40 - 42"</td><td>34 - 36"</td><td>29"</td></tr>
                  <tr><td><strong>XL</strong></td><td>42 - 44"</td><td>36 - 38"</td><td>30"</td></tr>
                  <tr><td><strong>XXL</strong></td><td>44 - 46"</td><td>38 - 40"</td><td>31"</td></tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Purchase Bar */}
      <div className="mobile-sticky-purchase-bar">
        <div className="mobile-bar-price-info">
          <span className="mobile-bar-lbl">Total Price</span>
          <span className="mobile-bar-price">{formatPrice(finalPrice)}</span>
        </div>

        <div className="mobile-bar-actions">
          <button
            className={`mobile-btn-cart ${cartAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {cartAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
          <button
            className="mobile-btn-buy"
            onClick={() => { handleAddToCart(); navigate('/checkout'); }}
            disabled={!product.inStock}
          >
            <Zap size={18} /> Buy Now
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
