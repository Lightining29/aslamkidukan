import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Sun } from 'lucide-react';
import interiorHeroImg from '../../assets/images/luxury_interior_hero.jpg';
import './MobileHeroBanner.css';

export default function MobileHeroBanner({ products = [], onOpenModal, onSelectCategory }) {
  const [current, setCurrent] = useState(0);
  const [spotlightOn, setSpotlightOn] = useState(true);

  const displayList = Array.isArray(products) && products.length > 0
    ? products
    : [
        {
          _id: 'default-1',
          name: 'Aytul Kursi Luxury Wall Art',
          price: 499,
          originalPrice: 999,
          image: '/stickers/niche_monstera_3d_1787582973768.jpg'
        }
      ];

  useEffect(() => {
    if (displayList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % Math.min(displayList.length, 5));
    }, 4500);
    return () => clearInterval(timer);
  }, [displayList.length]);

  const activeItem = displayList[current] || displayList[0];
  const activeImg = activeItem?.image || activeItem?.imageUrl || '/stickers/niche_monstera_3d_1787582973768.jpg';
  const price = activeItem?.finalPrice || activeItem?.price || 499;

  return (
    <div className="mobile-hero-carousel-wrap">
      <div
        className="mobile-interior-hero-card"
        onClick={() => onOpenModal && activeItem && onOpenModal(activeItem)}
      >
        {/* Living Room Interior Image */}
        <img
          src={interiorHeroImg}
          alt="Luxury Living Room"
          className="mobile-interior-bg"
        />

        {/* Ambient Ceiling Spotlight */}
        {spotlightOn && <div className="mobile-spotlight-glow" />}

        {/* Top Eyebrow Badge */}
        <div className="mobile-hero-top-badge">
          <span className="mhb-chip">
            <Sparkles size={11} /> LUXURY HOME DECOR
          </span>
          <button
            type="button"
            className="mhb-light-toggle"
            onClick={(e) => { e.stopPropagation(); setSpotlightOn(!spotlightOn); }}
          >
            <Sun size={11} /> {spotlightOn ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Hung Wall Art / Painting on Living Room Wall */}
        <div className="mobile-hung-painting-frame">
          <div className="mobile-painting-mat">
            <img
              src={activeImg}
              alt={activeItem?.name || 'Home Decor'}
              className="mobile-painting-img"
            />
            <div className="mobile-painting-glaze" />
          </div>
        </div>

        {/* Floating Bottom Info Pill */}
        <div className="mobile-room-info-card" onClick={(e) => { e.stopPropagation(); onOpenModal && activeItem && onOpenModal(activeItem); }}>
          <div className="mric-left">
            <span className="mric-tag">FEATURED DECOR</span>
            <h3 className="mric-title">{activeItem?.name || 'Luxury Wall Art'}</h3>
            <div className="mric-price-row">
              <span className="mric-price">₹{price}</span>
              {activeItem?.originalPrice ? (
                <span className="mric-orig">₹{activeItem.originalPrice}</span>
              ) : null}
            </div>
          </div>

          <button className="mric-action-btn">
            <span>View Details</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Pagination Dots */}
      {displayList.length > 1 && (
        <div className="mobile-hero-dots-row">
          {displayList.slice(0, 5).map((s, idx) => (
            <button
              key={s._id || s.id || idx}
              className={`hero-dot-btn ${idx === current ? 'active' : ''}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Product ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
