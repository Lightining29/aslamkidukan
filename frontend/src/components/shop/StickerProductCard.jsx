import React, { useState } from 'react';
import { Plus, Check, Heart, Eye, ZoomIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../api';
import './StickerProductCard.css';

export default function StickerProductCard({ product, onOpenModal }) {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [added, setAdded] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const wished = isInWishlist(product._id);
  const price = product.finalPrice || product.price;

  const handleCardClick = () => {
    setIsZooming(true);
    setTimeout(() => {
      onOpenModal(product);
      setIsZooming(false);
    }, 140);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (typeof setShowLoginModal === 'function') setShowLoginModal('login');
      return;
    }
    toggleWishlist(product);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);
  };

  return (
    <div
      className={`mobile-sticker-card ${isZooming ? 'is-zooming' : ''}`}
      onClick={handleCardClick}
    >
      {/* Top badges & wishlist */}
      <div className="sticker-card-top">
        {product.badge && (
          <span className="sticker-type-chip">{product.badge}</span>
        )}
        <button
          className={`sticker-wishlist-btn ${wished ? 'wished' : ''}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <div className={`heart-burst-wrapper ${heartBurst ? 'heart-burst-active' : ''}`}>
            <Heart size={15} fill={wished ? '#EF4444' : 'none'} color={wished ? '#EF4444' : '#64748B'} />
            {heartBurst && (
              <>
                <span className="heart-sparkle-particle particle-1" />
                <span className="heart-sparkle-particle particle-2" />
                <span className="heart-sparkle-particle particle-3" />
                <span className="heart-sparkle-particle particle-4" />
              </>
            )}
          </div>
        </button>
      </div>

      {/* 3D Product Image Container with Zoom Feedback */}
      <div className="sticker-image-stage">
        <img
          src={product.image}
          alt={product.name}
          className="sticker-3d-render-img"
          loading="lazy"
        />
        <div className="card-zoom-indicator-pill">
          <ZoomIn size={12} />
          <span>Zoom 3D</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="sticker-card-body">
        <h3 className="sticker-card-title">{product.name}</h3>
        <p className="sticker-card-tagline">{product.tagline || product.description}</p>
        
        {/* Price & Quick Add Row */}
        <div className="sticker-card-footer">
          <div className="sticker-price-block">
            <span className="sticker-currency-symbol">₹</span>
            <span className="sticker-price-num">{price}</span>
            {product.price > price && (
              <span className="sticker-old-price">₹{product.price}</span>
            )}
          </div>

          <button
            className={`sticker-plus-btn ${added ? 'added' : ''}`}
            onClick={handleQuickAdd}
            aria-label="Add to cart"
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
