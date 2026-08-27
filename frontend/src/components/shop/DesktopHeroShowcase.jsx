import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, Sun, ShieldCheck, Truck, Star, Award } from 'lucide-react';
import { WALL_COLORS } from '../../data/stickersCatalog';
import Bouncy3DLifeText from '../common/Bouncy3DLifeText';
import './DesktopHeroShowcase.css';

export default function DesktopHeroShowcase({ onExploreClick, onOpenModal, featuredSticker, products = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [spotlightOn, setSpotlightOn] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const roomRef = useRef(null);

  const displayList = Array.isArray(products) && products.length > 0
    ? products
    : (featuredSticker ? [featuredSticker] : []);

  const currentItem = displayList[activeIdx] || featuredSticker || displayList[0];

  const handleMouseMove = (e) => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const currentImg = currentItem?.image || currentItem?.imageUrl || '/stickers/niche_monstera_3d_1787582973768.jpg';
  const price = currentItem?.finalPrice || currentItem?.price || 499;

  return (
    <section className="desktop-hero-showcase-section">
      <div className="container desktop-hero-container">
        
        {/* Left Column: Editorial Headline & Actions */}
        <div className="desktop-hero-left">
          <div className="hero-eyebrow-chip">
            <Sparkles size={15} color="#10B981" />
            <span>✨ 2026 LUXURY HOME DECOR &amp; WALL ART</span>
          </div>

          <h1 className="desktop-hero-title">
            Elevate Your Space with <br />
            Modern Luxury Decor.
          </h1>

          <p className="desktop-hero-lead">
            Transform your living room, bedroom, and walls with handcrafted <strong>3D architectural wall art</strong>, <strong>aesthetic relief accents</strong>, and <strong>designer home decor</strong>.
          </p>

          <div className="desktop-hero-cta-group">
            <button className="desktop-hero-btn-primary" onClick={onExploreClick}>
              <span>Explore Home Decor</span>
              <ArrowRight size={18} />
            </button>
            <div className="desktop-discount-tag">
              <span className="discount-pill">SPECIAL OFFER</span>
              <span className="code-text">Direct from <strong>AAAN Cart</strong></span>
            </div>
          </div>

          {/* Micro Trust Stats */}
          <div className="desktop-hero-stats-row">
            <div className="hero-stat-box">
              <div className="stat-icon-wrap"><Award size={18} color="#F59E0B" /></div>
              <div>
                <strong>4.95 ★★★★★</strong>
                <span>Verified Customer Loved</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="hero-stat-box">
              <div className="stat-icon-wrap"><Truck size={18} color="#10B981" /></div>
              <div>
                <strong>Reliable Express Delivery</strong>
                <span>All India Safe &amp; Tracked Dispatch</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="hero-stat-box">
              <div className="stat-icon-wrap"><ShieldCheck size={18} color="#6366F1" /></div>
              <div>
                <strong>100% Quality Assured</strong>
                <span>Premium Luxury Finishes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 70% Real Interior Room Stage with Hanging Painting */}
        <div className="desktop-hero-right">
          <div
            ref={roomRef}
            className="interior-room-hero-stage"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onOpenModal && currentItem && onOpenModal(currentItem)}
          >
            {/* Background High-End Interior House Image */}
            <img
              src="/images/luxury_interior_hero.jpg"
              alt="Luxury Living Room Interior"
              className="interior-room-bg"
            />

            {/* Ambient Spotlight Beam from Ceiling */}
            {spotlightOn && <div className="interior-spotlight-glow" />}

            {/* Hung Wall Art / Painting on the Living Room Wall */}
            <div
              className="room-hung-painting-frame"
              style={{
                transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
              }}
            >
              <div className="painting-mat-border">
                <img
                  src={currentImg}
                  alt={currentItem?.name || 'Luxury Wall Art'}
                  className="painting-artwork-img"
                />
                {/* Artwork Glaze & Real Shadow Sheen */}
                <div className="painting-glass-glaze" />
              </div>
              <div className="painting-wall-drop-shadow" />
            </div>

            {/* Floating Glassmorphic Product Card in Room */}
            <div className="room-floating-product-card" onClick={(e) => { e.stopPropagation(); onOpenModal && currentItem && onOpenModal(currentItem); }}>
              <div className="rfp-badge-row">
                <span className="rfp-tag">🏡 FEATURED WALL ART</span>
                <button
                  type="button"
                  className="rfp-spotlight-toggle"
                  onClick={(e) => { e.stopPropagation(); setSpotlightOn(!spotlightOn); }}
                  title="Toggle Ceiling Spotlight"
                >
                  <Sun size={12} /> {spotlightOn ? 'Light: ON' : 'Light: OFF'}
                </button>
              </div>

              <h4 className="rfp-title">{currentItem?.name || 'Aytul Kursi Luxury Wall Art'}</h4>

              <div className="rfp-bottom-row">
                <div className="rfp-price-col">
                  <span className="rfp-price">₹{price}</span>
                  {currentItem?.originalPrice ? (
                    <span className="rfp-orig-price">₹{currentItem.originalPrice}</span>
                  ) : null}
                </div>
                <button className="rfp-view-btn">
                  <span>View in 3D</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Gallery Selector Dots / Thumbnails at Bottom Right */}
            {displayList.length > 1 && (
              <div className="room-gallery-picker" onClick={(e) => e.stopPropagation()}>
                {displayList.slice(0, 4).map((item, idx) => (
                  <button
                    key={item._id || item.id || idx}
                    className={`room-picker-thumb ${activeIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveIdx(idx)}
                    title={item.name}
                  >
                    <img
                      src={item.image || item.imageUrl || '/aaan-logo.svg'}
                      alt={item.name}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
