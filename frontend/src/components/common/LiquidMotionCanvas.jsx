import React from 'react';
import '../../styles/microinteractions.css';

export default function LiquidMotionCanvas() {
  return (
    <div className="liquid-motion-ambient-bg" aria-hidden="true">
      <div className="liquid-blob-orb blob-1" />
      <div className="liquid-blob-orb blob-2" />
      <div className="liquid-blob-orb blob-3" />
    </div>
  );
}
