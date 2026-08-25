import React, { useState } from 'react';
import { Sun, Sparkles, Check, ShoppingBag, Eye, Sliders, Layers } from 'lucide-react';
import { STICKER_PRODUCTS, WALL_COLORS, FINISH_OPTIONS } from '../../data/stickersCatalog';
import { useCart } from '../../context/CartContext';
import './Interactive3DStudio.css';

export default function Interactive3DStudio({ onOpenModal }) {
  const { addToCart } = useCart();
  const [selectedSticker, setSelectedSticker] = useState(STICKER_PRODUCTS[0]);
  const [selectedWall, setSelectedWall] = useState(WALL_COLORS[0]);
  const [selectedFinish, setSelectedFinish] = useState(FINISH_OPTIONS[0]);
  const [spotlightOn, setSpotlightOn] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [added, setAdded] = useState(false);

  const price = selectedSticker.finalPrice || selectedSticker.price;

  const handleAddToCart = () => {
    addToCart(
      {
        ...selectedSticker,
        selectedFinish: selectedFinish.name
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <section className="studio-3d-section" id="3d-studio">
      <div className="container studio-container">
        
        <div className="studio-header">
          <span className="studio-tag">
            <Sparkles size={14} /> LIVE INTERACTIVE SIMULATOR
          </span>
          <h2 className="studio-title">3D Wall Decor Studio</h2>
          <p className="studio-desc">
            Test any 3D plant or butterfly sticker on different room wall colors with interactive spotlight simulation before purchasing.
          </p>
        </div>

        <div className="studio-workspace-card">
          
          {/* Left: Interactive 3D Room Wall Viewport */}
          <div
            className="studio-viewport"
            style={{
              background: selectedWall.hex
            }}
          >
            {spotlightOn && <div className="studio-spotlight-beam-effect" />}

            {/* Rendered 3D Sticker with Real-time 3D Rotation */}
            <div
              className="studio-sticker-stage"
              style={{
                transform: `perspective(800px) rotateY(${rotationAngle}deg)`
              }}
            >
              <img
                src={selectedSticker.image}
                alt={selectedSticker.name}
                className="studio-rendered-sticker-img"
              />
            </div>

            {/* Room Base Floor Strip */}
            <div className="studio-floor-strip" />

            {/* Live Wall Badge Indicator */}
            <div className="studio-live-badge">
              <span className="live-dot" />
              <span>Wall: {selectedWall.name} · {selectedFinish.name}</span>
            </div>
          </div>

          {/* Right: Studio Configuration Controls */}
          <div className="studio-controls-panel">
            
            {/* Step 1: Select 3D Sticker */}
            <div className="studio-control-group">
              <label className="control-label">1. Choose 3D Sticker</label>
              <div className="studio-sticker-thumbs-row">
                {STICKER_PRODUCTS.slice(0, 5).map((p) => {
                  const isSelected = selectedSticker._id === p._id;
                  return (
                    <button
                      key={p._id}
                      className={`studio-thumb-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSticker(p)}
                      title={p.name}
                    >
                      <img src={p.image} alt={p.name} />
                      {isSelected && <span className="thumb-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Wall Paint Color */}
            <div className="studio-control-group">
              <label className="control-label">2. Wall Background Color</label>
              <div className="studio-wall-chips-row">
                {WALL_COLORS.map((w) => {
                  const isSelected = selectedWall.id === w.id;
                  return (
                    <button
                      key={w.id}
                      className={`wall-chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedWall(w)}
                    >
                      <span className="wall-swatch-circle" style={{ background: w.hex }} />
                      <span>{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Finish & Spotlight */}
            <div className="studio-control-group">
              <label className="control-label">3. Sticker Material &amp; Lighting</label>
              <div className="studio-finish-buttons">
                {FINISH_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    className={`finish-toggle-btn ${selectedFinish.id === f.id ? 'active' : ''}`}
                    onClick={() => setSelectedFinish(f)}
                  >
                    <span className="finish-color-dot" style={{ background: f.color }} />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>

              <div className="studio-toggles-row">
                <button
                  className={`spotlight-switch-btn ${spotlightOn ? 'on' : ''}`}
                  onClick={() => setSpotlightOn(!spotlightOn)}
                >
                  <Sun size={15} />
                  <span>{spotlightOn ? 'Ceiling Spotlight: ON' : 'Ceiling Spotlight: OFF'}</span>
                </button>
              </div>
            </div>

            {/* Step 4: 3D Rotation Slider */}
            <div className="studio-control-group">
              <div className="slider-label-row">
                <label className="control-label">3D Perspective Angle</label>
                <span className="angle-val">{rotationAngle}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="studio-angle-slider"
              />
            </div>

            {/* Price & Action Row */}
            <div className="studio-action-row">
              <div className="studio-price-block">
                <span className="studio-price-num">₹{price}</span>
                <span className="studio-price-orig">₹{selectedSticker.price}</span>
                <span className="studio-save-badge">50% OFF</span>
              </div>

              <button
                className={`studio-add-cart-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} />
                <span>{added ? 'Added to Cart ✓' : 'Add Customized Sticker'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
