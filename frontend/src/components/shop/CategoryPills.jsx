import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../../api';
import './CategoryPills.css';

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const allCategoryPill = { id: 'all', slug: 'all', name: 'All Decals', icon: '✨' };
  const displayCategories = [allCategoryPill, ...categories.map(c => ({
    id: c.slug || c.id || c._id,
    slug: c.slug || c.id || c._id,
    name: c.name,
    icon: '🪴'
  }))];

  return (
    <div className="mobile-category-pills-bar">
      <div className="mobile-category-pills-scroll">
        {displayCategories.map((cat) => {
          const isActive = selectedCategory === (cat.slug || cat.id);
          return (
            <button
              key={cat.slug || cat.id}
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.slug || cat.id)}
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
