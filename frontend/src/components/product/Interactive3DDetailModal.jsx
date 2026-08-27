import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Heart, ShoppingBag, Star, Sparkles, Check, Sun, Shield, RotateCw, X, Truck, Zap, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { WALL_COLORS } from '../../data/stickersCatalog';
import './Interactive3DDetailModal.css';

export default function Interactive3DDetailModal({ product, onClose, onBuyNow }) {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : '40 × 60 cm');
  const [selectedWall, setSelectedWall] = useState(WALL_COLORS[0]);
  const [spotlightOn, setSpotlightOn] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x, 1.75x, 2.5x
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

  // Extract multi-image gallery
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || product.imageUrl || '/aaan-logo.svg'];

  const currentImage = images[activeImageIndex] || images[0] || product.image || '/aaan-logo.svg';

  const wished = isInWishlist(product._id || product.id);
  const price = product.finalPrice || product.price || 0;
  const originalPrice = product.originalPrice || (product.price > price ? product.price : Math.round(price * 1.8));

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
            title="Click or Tap to Zoom"
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
                src={currentImage}
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

          {/* Multiple Image Thumbnails Gallery */}
          {images.length > 1 && (
            <div className="modal-gallery-thumbs-row">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`modal-gallery-thumb-btn ${activeImageIndex === idx ? 'selected' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  {activeImageIndex === idx && <span className="active-thumb-pip" />}
                </button>
              ))}
            </div>
          )}

          {/* Product Title & Price Header */}
          <div className="mobile-detail-info-block">
            
            <div className="detail-tags-row">
              <span className="detail-cat-badge">🌿 Home Decor</span>
              <span className="detail-discount-badge">Special Offer</span>
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
              {originalPrice > price && (
                <>
                  <span className="detail-price-orig">₹{originalPrice}</span>
                  <span className="detail-save-pill">Save ₹{originalPrice - price}</span>
                </>
              )}
            </div>

            {/* Rating and review count */}
            <div className="mobile-detail-rating-row">
              <div className="rating-pill">
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span className="rating-review-count">({product.reviewCount || 24} verified reviews)</span>
              <span className="stock-pill">In Stock · Ready to Dispatch</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="mobile-detail-description">
                {showMore
                  ? product.description
                  : `${product.description?.slice(0, 150)}${product.description?.length > 150 ? '... ' : ''}`}
                {product.description?.length > 150 && (
                  <button
                    className="show-more-toggle"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            )}

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
                <span className="qty-val-display">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Guarantees & Features */}
            <div className="sticker-guarantees-bar">
              <div className="guarantee-item">
                <Truck size={16} color="#10B981" />
                <div>
                  <strong>Free Express Delivery</strong>
                  <span>Delivery in 2-4 Days</span>
                </div>
              </div>
              <div className="guarantee-item">
                <Shield size={16} color="#6366F1" />
                <div>
                  <strong>100% Quality Guaranteed</strong>
                  <span>Direct from AAAN Cart</span>
                </div>
              </div>
              <div className="guarantee-item">
                <Zap size={16} color="#F59E0B" />
                <div>
                  <strong>Cash on Delivery Available</strong>
                  <span>Pay at Doorstep</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Sticky Mobile Floating Action Footer */}
        <div className="mobile-detail-bottom-actions">
          <div className="bottom-total-col">
            <span className="bottom-total-label">Total Payable</span>
            <div className="bottom-total-amount">
              <span className="curr">₹</span>
              <span className="num">{price * quantity}</span>
            </div>
          </div>

          <div className="bottom-action-buttons">
            <button
              className={`btn-add-cart-float ${addedAnim ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {addedAnim ? <Check size={18} /> : <ShoppingBag size={18} />}
              <span>{addedAnim ? 'Added!' : 'Add to Cart'}</span>
            </button>

            <button
              className="btn-buy-now-float"
              onClick={handleDirectBuy}
            >
              <Zap size={18} />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
