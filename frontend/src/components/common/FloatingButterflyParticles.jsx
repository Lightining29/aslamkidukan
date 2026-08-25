import React, { useEffect, useState } from 'react';
import './FloatingButterflyParticles.css';

export default function FloatingButterflyParticles() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Subtle parallax offset
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="floating-particles-layer" aria-hidden="true">
      {/* 3D Fluttering Butterfly 1 */}
      <div
        className="butterfly-particle p1"
        style={{
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`
        }}
      >
        <div className="butterfly-3d-wings">
          <span className="wing wing-left blue-foil" />
          <span className="wing wing-right blue-foil" />
        </div>
      </div>

      {/* 3D Fluttering Butterfly 2 */}
      <div
        className="butterfly-particle p2"
        style={{
          transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px)`
        }}
      >
        <div className="butterfly-3d-wings">
          <span className="wing wing-left gold-foil" />
          <span className="wing wing-right gold-foil" />
        </div>
      </div>

      {/* 3D Fluttering Butterfly 3 */}
      <div
        className="butterfly-particle p3"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`
        }}
      >
        <div className="butterfly-3d-wings">
          <span className="wing wing-left purple-foil" />
          <span className="wing wing-right purple-foil" />
        </div>
      </div>

      {/* Floating 3D Leaf 1 */}
      <div
        className="floating-leaf l1"
        style={{
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) rotate(${mousePos.x * 0.5}deg)`
        }}
      >
        🍃
      </div>

      {/* Floating 3D Leaf 2 */}
      <div
        className="floating-leaf l2"
        style={{
          transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px) rotate(${mousePos.y * 0.4}deg)`
        }}
      >
        🌿
      </div>
    </div>
  );
}
