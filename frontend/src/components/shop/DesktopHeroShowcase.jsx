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
            <span>✨ 2026 OFFICIAL 3D WALL ART COLLECTION</span>
          </div>

          <h1 className="desktop-hero-title">
            Breathe <Bouncy3DLifeText /> Into <br />
            Every Plain Wall.
          </h1>

          <p className="desktop-hero-lead">
            Discover hyper-realistic <strong>3D optical illusion niche alcoves</strong>, <strong>embossed botanical monstera decals</strong>, and <strong>flying holographic 3D butterfly sets</strong> with instant peel &amp; stick magic.
          </p>

          <div className="desktop-hero-cta-group">
            <button className="desktop-hero-btn-primary" onClick={onExploreClick}>
              <span>Explore 3D Catalog</span>
              <ArrowRight size={18} />
            </button>
            <div className="desktop-discount-tag">
              <span className="discount-pill">50% OFF</span>
              <span className="code-text">Code: <strong>3DART50</strong></span>
            </div>
          </div>

          {/* Micro Trust Stats */}
          <div className="desktop-hero-stats-row">
            <div className="hero-stat-box">
              <div className="stat-icon-wrap"><Award size={18} color="#F59E0B" /></div>
              <div>
                <strong>4.95 ★★★★★</strong>
                <span>Over 12,000+ Reviews</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="hero-stat-box">
              <div className="stat-icon-wrap"><Truck size={18} color="#10B981" /></div>
              <div>
                <strong>Free Express Dispatch</strong>
                <span>All India in 24 Hours</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="hero-stat-box">
              <div className="stat-icon-wrap"><ShieldCheck size={18} color="#6366F1" /></div>
              <div>
                <strong>3D Illusion Tested</strong>
                <span>Removable &amp; Residue-Free</span>
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
              {/* Back Card: 3D Blue Butterfly */}
              <div className="floating-preview-card card-back">
                <img
                  src="/stickers/blue_butterfly_3d_1787582894782.jpg"
                  alt="3D Blue Butterfly"
                  className="card-preview-img"
                />
                <span className="card-floating-pill">🦋 Foldable 3D Wings</span>
              </div>

              {/* Main Center Card: 3D Monstera Niche */}
              <div
                className="floating-preview-card card-front"
                onClick={() => onOpenModal(featuredSticker)}
              >
                <img
                  src="/stickers/niche_monstera_3d_1787582973768.jpg"
                  alt="3D Monstera Niche Wall Sticker"
                  className="card-preview-img"
                />
                <div className="card-front-info">
                  <span className="card-tag">3D OPTICAL ILLUSION NICHE</span>
                  <h4>3D Monstera Niche Wall Decal</h4>
                  <div className="card-front-foot">
                    <span className="card-price">₹499 <small>₹999</small></span>
                    <button className="card-interactive-btn">Click for 3D View</button>
                  </div>
                </div>
              </div>

              {/* Side Accent Card: 3D Echeveria Succulent */}
              <div className="floating-preview-card card-side">
                <img
                  src="/stickers/succulent_plant_3d_1787582910119.jpg"
                  alt="3D Succulent Sticker"
                  className="card-preview-img"
                />
                <span className="card-floating-pill">🌸 Layered 3D Relief</span>
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
