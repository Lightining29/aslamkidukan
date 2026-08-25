import React, { useState, useEffect } from 'react';
import './MobileHandPullIntro.css';

export default function MobileHandPullIntro({ children, onAnimationComplete }) {
  const [animPhase, setAnimPhase] = useState(() => {
    // Only run on mobile screens (< 1024px)
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'done';
    }
    return 'pulling'; // 'pulling' (0-1.2s) -> 'settling' (1.2-1.7s) -> 'done'
  });

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setAnimPhase('done');
      return;
    }

    // Phase 1: Pull cloth upwards with tension (0 to 1.2s)
    const t1 = setTimeout(() => {
      setAnimPhase('settling');
    }, 1200);

    // Phase 2: Complete and unmount all overlays (1.7s)
    const t2 = setTimeout(() => {
      setAnimPhase('done');
      if (onAnimationComplete) onAnimationComplete();
    }, 1750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onAnimationComplete]);

  // If on desktop or animation is finished, render clean children with 0 overhead
  if (animPhase === 'done') {
    return <>{children}</>;
  }

  const handleSkip = () => {
    setAnimPhase('done');
    if (onAnimationComplete) onAnimationComplete();
  };

  return (
    <div className={`cloth-pull-wrapper ${animPhase}`} onClick={handleSkip}>
      
      {/* Top Dynamic Island Frame */}
      <div className="cloth-pull-top-notch">
        <div className="notch-capsule" />
      </div>

      {/* 3D Hand Pinching Cloth Stage */}
      <div className={`cloth-pinch-stage ${animPhase}`}>
        <div className="cloth-pinch-image-box">
          <img
            src="/images/hand_pinching_cloth.jpg"
            alt="3D Hand Pulling Cloth"
            className="cloth-pinch-img"
          />
          {/* Radial Gradient blend layer to blend cloth edges smoothly into page */}
          <div className="cloth-bottom-blend-gradient" />
        </div>
      </div>

      {/* The Animated Mobile Website Content Sheet */}
      <div className={`cloth-ui-sheet ${animPhase}`}>
        {children}
      </div>

    </div>
  );
}
