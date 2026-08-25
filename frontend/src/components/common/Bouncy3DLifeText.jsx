import React, { useState } from 'react';
import './Bouncy3DLifeText.css';

export default function Bouncy3DLifeText() {
  const [isExcited, setIsExcited] = useState(false);

  const triggerExcitement = () => {
    setIsExcited(true);
    setTimeout(() => setIsExcited(false), 850);
  };

  return (
    <span
      className={`playful-3d-life-wrapper ${isExcited ? 'is-excited-jump' : ''}`}
      onMouseEnter={triggerExcitement}
      onClick={triggerExcitement}
      title="3D Life! Tap me for playful bouncy physics"
    >
      <span className="playful-char char-3">3</span>
      <span className="playful-char char-d">D</span>
      <span className="playful-space">&nbsp;</span>
      <span className="playful-char char-l">L</span>
      <span className="playful-char char-i">i</span>
      <span className="playful-char char-f">f</span>
      <span className="playful-char char-e">e</span>
      <span className="playful-sparkle-tail">✨</span>
    </span>
  );
}
