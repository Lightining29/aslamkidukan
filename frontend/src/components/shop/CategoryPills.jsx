import React from 'react';
import { STICKER_CATEGORIES } from '../../data/stickersCatalog';
import './CategoryPills.css';

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  return (
    <div className="mobile-category-pills-bar">
      <div className="mobile-category-pills-scroll">
        {STICKER_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="category-pill-icon">{cat.icon}</span>
              <span className="category-pill-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
