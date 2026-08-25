import React from 'react';
import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './MobileAppHeader.css';

export default function MobileAppHeader({ searchQuery, setSearchQuery, onSearchSubmit, onOpenMenu }) {
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Plant Lover';

  return (
    <div className="mobile-app-header-container">
      {/* Top Greeting Bar */}
      <div className="mobile-app-greeting-row">
        <div className="mobile-user-profile">
          <div className="mobile-user-avatar">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={displayName} />
            ) : (
              <span className="avatar-letter">🌿</span>
            )}
          </div>
          <div className="mobile-user-text">
            <span className="greeting-small">Hello,</span>
            <span className="greeting-name">{displayName} 🪴</span>
          </div>
        </div>

        <div className="mobile-header-actions">
          <button className="mobile-icon-circle-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="notification-dot" />
          </button>
          <button className="mobile-icon-circle-btn" aria-label="Menu" onClick={onOpenMenu}>
            <Menu size={18} />
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
            placeholder="Search 3D plant & butterfly stickers..."
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
