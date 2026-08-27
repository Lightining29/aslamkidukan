import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './MobileAppHeader.css';

export default function MobileAppHeader({ searchQuery, setSearchQuery, onSearchSubmit, onOpenMenu }) {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <div className="mobile-app-header-container">
      {/* Top Brand & Greeting Row */}
      <div className="mobile-app-greeting-row">
        <Link to="/" className="mobile-brand-wrapper">
          <div className="mobile-brand-info">
            <div className="mobile-brand-name">
              <span>AAAN</span> Cart
              <span className="mobile-brand-tag">3D</span>
            </div>
            <div className="mobile-greeting-sub">
              {user ? `Hi, ${displayName} 👋` : 'Explore 3D Decals 🌿'}
            </div>
          </div>
        </Link>

        <div className="mobile-header-actions">
          <Link to={user ? "/account" : "/"} className="mobile-icon-circle-btn" aria-label="Account">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={displayName} className="mobile-user-mini-avatar" />
            ) : (
              <Bell size={18} />
            )}
            <span className="notification-dot" />
          </Link>
          <button className="mobile-icon-circle-btn" aria-label="Menu" onClick={onOpenMenu}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Rounded Search Bar */}
      <div className="mobile-search-bar-wrap">
        <form className="mobile-search-form" onSubmit={onSearchSubmit}>
          <Search size={18} className="mobile-search-glass-icon" />
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Search modern home decor & 3D wall art..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
