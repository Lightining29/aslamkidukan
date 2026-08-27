import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, Sun, ShieldCheck, Truck, Star, Award } from 'lucide-react';
import { WALL_COLORS } from '../../data/stickersCatalog';
import Bouncy3DLifeText from '../common/Bouncy3DLifeText';
import './DesktopHeroShowcase.css';

export default function DesktopHeroShowcase({ onExploreClick, onOpenModal, featuredSticker }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlightOn, setSpotlightOn] = useState(true);
  const [activeWall, setActiveWall] = useState(WALL_COLORS[0]);
  const heroCardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -22;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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
                <strong>Free Express Delivery</strong>
                <span>All India Fast Dispatch</span>
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

        {/* Right Column: Interactive 3D Perspective Card Trio */}
        <div className="desktop-hero-right">
          <div
            ref={heroCardRef}
            className="desktop-3d-hero-stage"
            style={{ background: activeWall.hex }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {spotlightOn && <div className="desktop-spotlight-beam" />}

            {/* Overlapping 3D Cards Stack */}
            <div
              className="desktop-3d-cards-stack"
              style={{
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
              }}
            >
              {/* Back Card */}
              <div className="floating-preview-card card-back">
                <img
                  src={featuredSticker?.images?.[1] || featuredSticker?.image || '/stickers/blue_butterfly_3d_1787582894782.jpg'}
                  alt="Luxury Decor Accent"
                  className="card-preview-img"
                />
                <span className="card-floating-pill">✨ Modern Interior</span>
              </div>

              {/* Main Center Card */}
              <div
                className="floating-preview-card card-front"
                onClick={() => onOpenModal && featuredSticker && onOpenModal(featuredSticker)}
              >
                <img
                  src={featuredSticker?.image || featuredSticker?.imageUrl || '/stickers/niche_monstera_3d_1787582973768.jpg'}
                  alt={featuredSticker?.name || 'Luxury Home Decor'}
                  className="card-preview-img"
                />
                <div className="card-front-info">
                  <span className="card-tag">FEATURED HOME DECOR</span>
                  <h4>{featuredSticker?.name || 'Luxury 3D Wall Art Accent'}</h4>
                  <div className="card-front-foot">
                    <span className="card-price">₹{featuredSticker?.finalPrice || featuredSticker?.price || 499} {featuredSticker?.originalPrice ? <small>₹{featuredSticker.originalPrice}</small> : null}</span>
                    <button className="card-interactive-btn">View Decor</button>
                  </div>
                </div>
              </div>

              {/* Side Accent Card */}
              <div className="floating-preview-card card-side">
                <img
                  src={featuredSticker?.images?.[2] || featuredSticker?.image || '/stickers/succulent_plant_3d_1787582910119.jpg'}
                  alt="Aesthetic Living Accent"
                  className="card-preview-img"
                />
                <span className="card-floating-pill">🏡 Aesthetic Living</span>
              </div>
            </div>

            {/* Stage Interactive Controls */}
            <div className="desktop-stage-toolbar">
              <button
                className={`desktop-light-toggle ${spotlightOn ? 'on' : ''}`}
                onClick={() => setSpotlightOn(!spotlightOn)}
              >
                <Sun size={14} />
                <span>{spotlightOn ? 'Spotlight: ON' : 'Spotlight: OFF'}</span>
              </button>

              <div className="desktop-wall-selector">
                <span className="wall-selector-label">Wall:</span>
                {WALL_COLORS.map((w) => (
                  <button
                    key={w.id}
                    className={`desktop-wall-dot ${activeWall.id === w.id ? 'active' : ''}`}
                    style={{ background: w.hex }}
                    onClick={() => setActiveWall(w)}
                    title={w.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
