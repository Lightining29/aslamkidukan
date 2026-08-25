import React, { useState, useEffect } from 'react';
import '../../styles/pageTransitions.css';

export default function PageTransitionCutout({ 
  variant = 'default', 
  title = 'AAAN CART', 
  subtitle = '3D LUXURY WALL DECOR' 
}) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
    }, 850);

    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  // Luxury Silk Curtain for Dashboard & Admin
  if (variant === 'curtain') {
    return (
      <div className="luxury-curtain-overlay" aria-hidden="true">
        <div className="luxury-curtain-leaf leaf-left">
          <div className="curtain-laser-seam" />
        </div>
        <div className="luxury-curtain-leaf leaf-right">
          <div className="curtain-laser-seam" />
        </div>
        <div className="luxury-curtain-seal">
          <div className="seal-glass-card">
            <span className="seal-icon">🌿</span>
            <div className="seal-texts">
              <strong className="seal-brand">{title}</strong>
              <span className="seal-sub">{subtitle}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exact Original Black Dual-Diagonal Cutout Reveal for Home Page
  return (
    <div className="cutout-page-transition-overlay" aria-hidden="true">
      {/* Dual Diagonal Cutout Slices */}
      <div className="cutout-slice-top" />
      
      {/* Glowing Brand Emblem in the Cutout Center */}
      <div className="cutout-brand-emblem">
        <span style={{ fontSize: '2.2rem' }}>🌿</span>
        <strong style={{ letterSpacing: '1.5px', fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
          {title || 'AAAN CART'}
        </strong>
      </div>

      <div className="cutout-slice-bottom" />
    </div>
  );
}
