import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Bouncy3DLifeText from '../common/Bouncy3DLifeText';
import './MobileHeroBanner.css';

const HERO_SLIDES = [
  {
    id: 1,
    tag: '⚡ 3D WALL ART INNOVATION',
    title: 'Transform Walls with 3D Life',
    subtitle: 'Hyperrealistic optical illusion alcoves & 3D butterfly wall sets',
    discount: 'UP TO 50% OFF',
    image: '/stickers/niche_monstera_3d_1787582973768.jpg',
    bgColor: 'linear-gradient(135deg, #F5EBE1 0%, #E8DFD8 100%)',
    badgeColor: '#10B981',
    cta: 'Shop 3D Niches',
    category: 'niche'
  },
  {
    id: 2,
    tag: '🦋 HOLOGRAPHIC 3D COLLECTION',
    title: 'Flying Crystal Butterfly Sets',
    subtitle: 'Foldable 3D wings with iridescent metallic shimmer & real shadows',
    discount: 'FLAT 50% OFF',
    image: '/stickers/blue_butterfly_3d_1787582894782.jpg',
    bgColor: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    badgeColor: '#0284C7',
    cta: 'Explore Butterflies',
    category: 'butterflies'
  },
  {
    id: 3,
    tag: '🌸 BOTANICAL EMBOSSED VINYL',
    title: '3D Succulents & Flora Decals',
    subtitle: 'Glossy multi-layer relief leaves and blooms for modern living rooms',
    discount: 'FROM ₹299',
    image: '/stickers/succulent_plant_3d_1787582910119.jpg',
    bgColor: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
    badgeColor: '#EC4899',
    cta: 'Shop Botanicals',
    category: 'plants'
  }
];

export default function MobileHeroBanner({ onSelectCategory }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <div className="mobile-hero-carousel-wrap">
      <div
        className="mobile-hero-banner-card"
        style={{ background: slide.bgColor }}
      >
        <div className="mobile-hero-text-side">
          <span className="mobile-hero-chip" style={{ color: slide.badgeColor }}>
            <Sparkles size={11} /> {slide.tag}
          </span>
          <h2 className="mobile-hero-heading">
            {slide.id === 1 ? (
              <>Transform Walls with <Bouncy3DLifeText /></>
            ) : (
              slide.title
            )}
          </h2>
          <p className="mobile-hero-desc">{slide.subtitle}</p>

          <div className="mobile-hero-bottom-action">
            <button
              className="mobile-hero-shop-btn"
              onClick={() => onSelectCategory(slide.category)}
            >
              <span>{slide.cta}</span>
              <ArrowRight size={14} />
            </button>
            <span className="mobile-hero-discount-badge">{slide.discount}</span>
          </div>
        </div>

        <div className="mobile-hero-image-side">
          <div className="mobile-hero-3d-img-container">
            <img
              src={slide.image}
              alt={slide.title}
              className="mobile-hero-3d-asset"
            />
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="mobile-hero-dots-row">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            className={`hero-dot-btn ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
