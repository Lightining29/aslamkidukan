import React from 'react';
import { Star, Sparkles, ArrowUpRight } from 'lucide-react';
import { STICKER_PRODUCTS } from '../../data/stickersCatalog';
import './MovingStickersMarquee.css';

export default function MovingStickersMarquee({ onOpenModal }) {
  // Duplicate for seamless infinite loop
  const row1 = [...STICKER_PRODUCTS, ...STICKER_PRODUCTS];
  const row2 = [...STICKER_PRODUCTS.slice().reverse(), ...STICKER_PRODUCTS.slice().reverse()];

  return (
    <section className="moving-marquee-section">
      <div className="container marquee-header-row">
        <div className="marquee-header-left">
          <span className="marquee-tag">
            <Sparkles size={14} /> LIVE 3D WALL GALLERY
          </span>
          <h2 className="marquee-title">
            Trending 3D Stickers in Motion
          </h2>
          <p className="marquee-subtitle">
            Hover over any 3D sticker to pause and preview realistic optical depth &amp; illumination.
          </p>
        </div>
      </div>

      {/* Moving Row 1 - Leftward Flow */}
      <div className="marquee-track-wrapper">
        <div className="marquee-track track-left">
          {row1.map((item, idx) => (
            <div
              key={`r1-${item._id}-${idx}`}
              className="marquee-sticker-card"
              onClick={() => onOpenModal(item)}
            >
              <div className="marquee-card-img-box">
                <img
                  src={item.image}
                  alt={item.name}
                  className="marquee-card-img"
                  loading="lazy"
                />
                <span className="marquee-card-badge">{item.badge}</span>
              </div>

              <div className="marquee-card-info">
                <div className="marquee-card-meta">
                  <span className="marquee-card-cat">{item.category}</span>
                  <div className="marquee-card-rating">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <h4 className="marquee-card-name">{item.name}</h4>
                <div className="marquee-card-price-row">
                  <span className="marquee-price">₹{item.finalPrice || item.price}</span>
                  <span className="marquee-explore-pill">
                    3D View <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Moving Row 2 - Rightward Flow */}
      <div className="marquee-track-wrapper track-row-2">
        <div className="marquee-track track-right">
          {row2.map((item, idx) => (
            <div
              key={`r2-${item._id}-${idx}`}
              className="marquee-sticker-card card-variant-alt"
              onClick={() => onOpenModal(item)}
            >
              <div className="marquee-card-img-box">
                <img
                  src={item.image}
                  alt={item.name}
                  className="marquee-card-img"
                  loading="lazy"
                />
                <span className="marquee-card-badge">{item.badge}</span>
              </div>

              <div className="marquee-card-info">
                <div className="marquee-card-meta">
                  <span className="marquee-card-cat">{item.category}</span>
                  <div className="marquee-card-rating">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <h4 className="marquee-card-name">{item.name}</h4>
                <div className="marquee-card-price-row">
                  <span className="marquee-price">₹{item.finalPrice || item.price}</span>
                  <span className="marquee-explore-pill">
                    3D View <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
