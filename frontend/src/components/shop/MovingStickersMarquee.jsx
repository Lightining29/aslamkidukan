import React from 'react';
import { Star, Sparkles, ArrowUpRight } from 'lucide-react';
import { STICKER_PRODUCTS } from '../../data/stickersCatalog';
import './MovingStickersMarquee.css';

export default function MovingStickersMarquee({ products = [], onOpenModal }) {
  // Combine database products with catalog presets (database products first)
  const list = (products && products.length > 0)
    ? [...products, ...STICKER_PRODUCTS.filter(s => !products.some(p => p._id === s._id || p.slug === s.slug))]
    : STICKER_PRODUCTS;

  // Duplicate for seamless infinite marquee loop
  const row1 = [...list, ...list];
  const row2 = [...list.slice().reverse(), ...list.slice().reverse()];

  const getImg = (item) => item.image || item.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80';
  const getCat = (item) => typeof item.category === 'string' ? item.category : (item.category?.name || item.categorySlug || '3D Wall Art');
  const getPrice = (item) => item.finalPrice || item.price || 499;
  const getBadge = (item) => item.badge || (item.bestseller ? 'Bestseller' : 'New Drop');
  const getRating = (item) => item.rating || 4.9;

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
              key={`r1-${item._id || item.id || item.slug}-${idx}`}
              className="marquee-sticker-card"
              onClick={() => onOpenModal && onOpenModal(item)}
            >
              <div className="marquee-card-img-box">
                <img
                  src={getImg(item)}
                  alt={item.name}
                  className="marquee-card-img"
                  loading="lazy"
                />
                <span className="marquee-card-badge">{getBadge(item)}</span>
              </div>

              <div className="marquee-card-info">
                <div className="marquee-card-meta">
                  <span className="marquee-card-cat">{getCat(item)}</span>
                  <div className="marquee-card-rating">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{getRating(item)}</span>
                  </div>
                </div>
                <h4 className="marquee-card-name">{item.name}</h4>
                <div className="marquee-card-price-row">
                  <span className="marquee-price">₹{getPrice(item)}</span>
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
              key={`r2-${item._id || item.id || item.slug}-${idx}`}
              className="marquee-sticker-card card-variant-alt"
              onClick={() => onOpenModal && onOpenModal(item)}
            >
              <div className="marquee-card-img-box">
                <img
                  src={getImg(item)}
                  alt={item.name}
                  className="marquee-card-img"
                  loading="lazy"
                />
                <span className="marquee-card-badge">{getBadge(item)}</span>
              </div>

              <div className="marquee-card-info">
                <div className="marquee-card-meta">
                  <span className="marquee-card-cat">{getCat(item)}</span>
                  <div className="marquee-card-rating">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{getRating(item)}</span>
                  </div>
                </div>
                <h4 className="marquee-card-name">{item.name}</h4>
                <div className="marquee-card-price-row">
                  <span className="marquee-price">₹{getPrice(item)}</span>
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
