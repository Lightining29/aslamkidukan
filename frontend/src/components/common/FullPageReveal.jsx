import React, { useState, useEffect } from 'react';
import '../../styles/microinteractions.css';

export default function FullPageReveal() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="page-reveal-curtain-overlay" aria-hidden="true">
      <div className="page-reveal-panel-top" />
      <div className="page-reveal-center-emblem">
        <span style={{ fontSize: '2rem' }}>🌿</span>
        <strong style={{ letterSpacing: '1px', fontSize: '1.2rem', fontFamily: "'Outfit', sans-serif" }}>
          AAAN CART
        </strong>
      </div>
      <div className="page-reveal-panel-bottom" />
    </div>
  );
}
