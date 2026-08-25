import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Heart, ShoppingBag, Star, Sparkles, Check, Sun, Shield, RotateCw, X, Truck, Zap, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FINISH_OPTIONS, WALL_COLORS } from '../../data/stickersCatalog';
import './Interactive3DDetailModal.css';

export default function Interactive3DDetailModal({ product, onClose, onBuyNow }) {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const [selectedFinish, setSelectedFinish] = useState(FINISH_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : '40 × 60 cm');
  const [selectedWall, setSelectedWall] = useState(WALL_COLORS[0]);
  const [spotlightOn, setSpotlightOn] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1); // 1x, 1.7x, 2.4x
  const [isClosing, setIsClosing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const containerRef = useRef(null);
  const imageWrapRef = useRef(null);
  const rectRef = useRef(null);
  const rafRef = useRef(null);

  // Lock body scroll when modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!product) return null;

  const wished = isInWishlist(product._id);
  const price = product.finalPrice || product.price;
  const originalPrice = product.price > price ? product.price : Math.round(price * 1.8);

  // Smooth Cut-Out Close Handler
  const handleAnimatedClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 260);
  };

  // Cached bounding rect on mouse enter to eliminate forced synchronous reflows
  const handleMouseEnter = () => {
    if (containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
  };

  // Direct GPU Transform Update via requestAnimationFrame (Zero React re-render scroll lag)
  const handleMouseMove = (e) => {
    if (!rectRef.current && containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    if (!rect || !imageWrapRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!imageWrapRef.current) return;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * (zoomLevel > 1 ? 24 : 14);
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * (zoomLevel > 1 ? -24 : -14);
      imageWrapRef.current.style.transform = `perspective(750px) rotateX(${y}deg) rotateY(${x}deg) scale3d(${zoomLevel}, ${zoomLevel}, ${zoomLevel})`;
    });
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (imageWrapRef.current) {
      imageWrapRef.current.style.transform = `perspective(750px) rotateX(0deg) rotateY(0deg) scale3d(${zoomLevel}, ${zoomLevel}, ${zoomLevel})`;
    }
  };

  // Reset or update transform when zoom level changes
  useEffect(() => {
    if (imageWrapRef.current) {
      imageWrapRef.current.style.transform = `perspective(750px) rotateX(0deg) rotateY(0deg) scale3d(${zoomLevel}, ${zoomLevel}, ${zoomLevel})`;
    }
  }, [zoomLevel]);

  // Cycle Zoom Levels: 1x -> 1.75x -> 2.5x -> 1x
  const handleToggleZoom = (e) => {
    e.stopPropagation();
    setZoomLevel((z) => {
      if (z === 1) return 1.75;
      if (z === 1.75) return 2.5;
      return 1;
    });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (typeof setShowLoginModal === 'function') setShowLoginModal('login');
      return;
    }
    toggleWishlist(product);
  };

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        selectedFinish: selectedFinish.name,
        selectedSize: selectedSize
      },
      quantity
    );
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  const handleDirectBuy = () => {
    addToCart(
      {
        ...product,
        selectedFinish: selectedFinish.name,
        selectedSize: selectedSize
      },
      quantity
    );
    if (onBuyNow) {
      onBuyNow();
    } else {
      window.location.href = '/checkout';
    }
  };

  const modalContent = (
    <div
      className={`mobile-detail-modal-overlay ${isClosing ? 'modal-zoom-out' : 'modal-zoom-in'}`}
      onClick={handleAnimatedClose}
    >
      <div
        className={`mobile-detail-modal-sheet ${isClosing ? 'sheet-zoom-out' : 'sheet-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="mobile-detail-header-bar">
          <button className="detail-back-btn" onClick={handleAnimatedClose} aria-label="Close">
            <X size={20} />
          </button>
          <div className="detail-header-brand-badge">
            <span className="live-dot-pulse" />
            <span>3D Interactive Preview</span>
          </div>
          <button
            className={`detail-heart-btn ${wished ? 'wished' : ''}`}
            onClick={handleWishlist}
            aria-label="Wishlist"
          >
            <Heart size={19} fill={wished ? '#EF4444' : 'none'} color={wished ? '#EF4444' : '#0F172A'} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mobile-detail-scroll-body">
          
          {/* Interactive 3D Showcase Stage with Zoom Lens */}
          <div
            ref={containerRef}
            className={`mobile-3d-stage-card ${zoomLevel > 1 ? 'is-zoomed' : ''}`}
            style={{
              background: selectedWall.hex
            }}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleToggleZoom}
            title="Click or Tap to Zoom 3D Sticker"
          >
            {/* Optional Spotlight Effect Glow Overlay */}
            {spotlightOn && (
              <div className="stage-spotlight-beam-overlay" />
            )}

            {/* 3D Render Image with Dynamic GPU Perspective Tilt (Zero Lag) */}
            <div
              ref={imageWrapRef}
              className="stage-3d-image-wrap"
              style={{
                transform: `perspective(750px) rotateX(0deg) rotateY(0deg) scale3d(${zoomLevel}, ${zoomLevel}, ${zoomLevel})`
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="stage-3d-main-img"
              />
            </div>

            {/* Floor strip */}
            <div className="stage-floor-strip" />

            {/* Interactive Zoom Pill Indicator / Trigger */}
            <button
              type="button"
              className={`stage-zoom-lens-btn ${zoomLevel > 1 ? 'zoomed' : ''}`}
              onClick={handleToggleZoom}
            >
              {zoomLevel === 1 ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
              <span>{zoomLevel === 1 ? 'Tap to Zoom' : `${zoomLevel}x Zoom`}</span>
            </button>

            {/* Interactive Wall Simulation & Light Controls */}
            <div className="stage-controls-overlay" onClick={(e) => e.stopPropagation()}>
              <button
                className={`stage-pill-control ${spotlightOn ? 'active' : ''}`}
                onClick={() => setSpotlightOn(!spotlightOn)}
                title="Toggle Spotlight Beam"
              >
                <Sun size={13} />
                <span>{spotlightOn ? 'Spotlight: ON' : 'Spotlight: OFF'}</span>
              </button>

              <div className="stage-wall-swatches">
                {WALL_COLORS.map((w) => (
                  <button
                    key={w.id}
                    className={`wall-color-dot ${selectedWall.id === w.id ? 'active' : ''}`}
                    style={{ background: w.hex }}
                    onClick={() => setSelectedWall(w)}
                    title={`Wall: ${w.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Live Wall Badge */}
            <div className="stage-wall-label-pill">
              Wall: {selectedWall.name}
            </div>
          </div>

          {/* Product Title & Price Header */}
          <div className="mobile-detail-info-block">
            
            <div className="detail-tags-row">
              <span className="detail-cat-badge">🌿 3D Wall Decor</span>
              <span className="detail-discount-badge">50% OFF</span>
              <span className="detail-free-ship-badge"><Truck size={12} /> Free Shipping</span>
            </div>

            <div className="mobile-detail-title-row">
              <h1 className="mobile-detail-product-name">{product.name}</h1>
            </div>

            {/* Price & Savings */}
            <div className="detail-pricing-box">
              <div className="detail-price-main">
                <span className="detail-currency">₹</span>
                <span className="detail-price-val">{price}</span>
              </div>
              <span className="detail-price-orig">₹{originalPrice}</span>
              <span className="detail-save-pill">Save ₹{originalPrice - price}</span>
            </div>

            {/* Rating and review count */}
            <div className="mobile-detail-rating-row">
              <div className="rating-pill">
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span className="rating-review-count">({product.reviewCount || 312} verified reviews)</span>
              <span className="stock-pill">In Stock · Ready to Dispatch</span>
            </div>

            {/* Description */}
            <p className="mobile-detail-description">
              {showMore
                ? product.description
                : `${product.description?.slice(0, 150)}... `}
              <button
                className="show-more-toggle"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? 'Show less' : 'Read more'}
              </button>
            </p>

            {/* Finish / Material Options */}
            <div className="mobile-detail-options-group">
              <div className="options-header-row">
                <label className="options-group-title">Sticker Finish Material</label>
                <span className="selected-finish-label">{selectedFinish.name}</span>
              </div>
              <div className="finish-swatches-grid">
                {FINISH_OPTIONS.map((finish) => {
                  const isSelected = selectedFinish.id === finish.id;
                  return (
                    <button
                      key={finish.id}
                      className={`finish-swatch-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedFinish(finish)}
                    >
                      <div
                        className="finish-swatch-preview"
                        style={{ background: finish.color }}
                      >
                        {isSelected && <Check size={12} color="#FFFFFF" />}
                      </div>
                      <div className="finish-swatch-text">
                        <span className="finish-swatch-name">{finish.name}</span>
                        <span className="finish-swatch-tag">{finish.tag}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mobile-detail-options-group">
              <label className="options-group-title">Select Size / Dimension</label>
              <div className="size-pills-row">
                {(product.sizes || ['40 × 60 cm', '50 × 80 cm', '60 × 100 cm']).map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      className={`size-pill-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mobile-detail-options-group qty-group">
              <label className="options-group-title">Quantity</label>
              <div className="qty-stepper-box">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-num">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Quality Guarantees Bar */}
            <div className="sticker-guarantees-bar">
              <div className="guarantee-item">
                <Shield size={16} color="#10B981" />
                <span>3D Optical Depth Tested</span>
              </div>
              <div className="guarantee-item">
                <Sparkles size={16} color="#6366F1" />
                <span>Zero Residue Peel &amp; Stick</span>
              </div>
              <div className="guarantee-item">
                <Zap size={16} color="#F59E0B" />
                <span>Waterproof &amp; Wipeable</span>
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="mobile-detail-sticky-bar">
          <button
            className={`detail-add-cart-outline-btn ${addedAnim ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} />
            <span>{addedAnim ? 'Added to Cart ✓' : 'Add to Cart'}</span>
          </button>
          
          <button
            className="detail-buy-now-btn"
            onClick={handleDirectBuy}
          >
            <ShoppingBag size={18} />
            <span>Buy Now · ₹{price * quantity}</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
