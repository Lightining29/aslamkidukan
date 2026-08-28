import React, { useState, useEffect } from 'react';
import { Sun, Sparkles, Check, ShoppingBag, Eye, Sliders, Layers } from 'lucide-react';
import { WALL_COLORS, FINISH_OPTIONS } from '../../data/stickersCatalog';
import { useCart } from '../../context/CartContext';
import './Interactive3DStudio.css';

export default function Interactive3DStudio({ products = [], onOpenModal }) {
  const { addToCart } = useCart();
  const [selectedSticker, setSelectedSticker] = useState(products[0] || null);
  const [selectedWall, setSelectedWall] = useState(WALL_COLORS[0]);
  const [selectedFinish, setSelectedFinish] = useState(FINISH_OPTIONS[0]);
  const [spotlightOn, setSpotlightOn] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedSticker(products[0]);
    } else {
      setSelectedSticker(null);
    }
  }, [products]);

  if (!products || products.length === 0 || !selectedSticker) {
    return null;
  }

  const price = selectedSticker.finalPrice || selectedSticker.price || 0;
  const stickerImage = selectedSticker.image || selectedSticker.imageUrl || '/aaan-logo.svg';

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
            {/* Simulated Spotlight Beam Overlay */}
            {spotlightOn && (
              <div className="spotlight-cone-fx" />
            )}

            {/* Floating 3D Optical Illusion Sticker */}
            <div
              className="sticker-3d-stage"
              style={{
                transform: `rotateY(${rotationAngle}deg) perspective(1000px)`,
                filter: spotlightOn ? 'drop-shadow(0 25px 35px rgba(0,0,0,0.35))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
              }}
            >
              <img
                src={stickerImage}
                alt={selectedSticker.name}
                className="sticker-stage-img"
              />
              
              {/* Trompe-l'œil Niche Depth Border Simulation */}
              <div className="niche-depth-inset-shadow" />
            </div>

            {/* Interactive Stage Overlay Badges */}
            <div className="viewport-overlay-badges">
              <span className="wall-color-indicator" style={{ color: selectedWall.textColor }}>
                Wall: {selectedWall.name}
              </span>
              <button
                className={`spotlight-toggle-btn ${spotlightOn ? 'on' : 'off'}`}
                onClick={() => setSpotlightOn(!spotlightOn)}
              >
                <Sun size={14} /> {spotlightOn ? 'Spotlight ON' : 'Ambient Room'}
              </button>
            </div>
          </div>

          {/* Right: Studio Customization Panel */}
          <div className="studio-controls-panel">
            
            {/* Step 1: Select 3D Sticker */}
            <div className="studio-control-group">
              <label className="control-label">1. Choose 3D Sticker</label>
              <div className="studio-sticker-thumbs-row">
                {products.slice(0, 5).map((p) => {
                  const isSelected = (selectedSticker._id || selectedSticker.id || selectedSticker.slug) === (p._id || p.id || p.slug);
                  return (
                    <button
                      key={p._id || p.id || p.slug}
                      className={`studio-thumb-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSticker(p)}
                      title={p.name}
                    >
                      <img src={p.image || p.imageUrl || '/aaan-logo.svg'} alt={p.name} />
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

            {/* Step 3: Material & Finish */}
            <div className="studio-control-group">
              <label className="control-label">3. Premium Surface Finish</label>
              <div className="studio-finish-pills-row">
                {FINISH_OPTIONS.map((f) => {
                  const isSelected = selectedFinish.id === f.id;
                  return (
                    <button
                      key={f.id}
                      className={`finish-pill-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedFinish(f)}
                    >
                      <span className="finish-tag-badge">{f.tag}</span>
                      <strong>{f.name}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: 3D Angle Slider */}
            <div className="studio-control-group">
              <div className="slider-label-row">
                <label className="control-label">4. Perspective Depth Angle</label>
                <span className="angle-deg-val">{rotationAngle}°</span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="perspective-range-input"
              />
            </div>

            {/* Sticky Action Footer */}
            <div className="studio-bottom-action-bar">
              <div>
                <span className="studio-price-tag">₹{price}</span>
                <span className="studio-free-ship">Reliable Delivery &amp; COD Available</span>
              </div>

              <div className="studio-action-btns">
                <button
                  className="btn-quick-preview"
                  onClick={() => onOpenModal && onOpenModal(selectedSticker)}
                >
                  <Eye size={16} /> View Details
                </button>
                <button
                  className={`btn-add-studio-cart ${added ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
