import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Sparkles,
  Settings as SettingsIcon,
  CreditCard,
  Award,
  Landmark,
  Lock,
  Sliders,
  Shield,
  HelpCircle,
  MessageSquare,
  Globe,
  LogOut,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api';
import { toastSuccess, toastError } from '../../utils/toast.js';
import './ModernUserProfileView.css';

export default function ModernUserProfileView({ onOpenSupport }) {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Biometric toggle switch state
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || 'Keira');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.city || 'New Delhi');
  const [address, setAddress] = useState(user?.address || '75 Main Street');
  const [profileSaving, setProfileSaving] = useState(false);

  // Upgrade to Pro Modal
  const [showProModal, setShowProModal] = useState(false);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const userEmail = user?.email || 'johndeo@gmail.com';
  const userName = user?.name || 'Keira';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ name, phone, city, address });
      }
      toastSuccess('Profile updated! ✨', 'Your account details have been saved.');
      setShowEditModal(false);
    } catch (err) {
      toastError('Update failed', err.message || 'Could not update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toastError('Passwords do not match', 'Please verify your password.');
    }
    setPwdSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      toastSuccess('Password updated!', 'Your password has been changed.');
      setShowPasswordModal(false);
    } catch (err) {
      toastError('Password error', err.message);
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="modern-ios-profile-page">
      {/* Top iOS Navigation Bar */}
      <div className="ios-profile-navbar">
        <button
          className="ios-nav-circle-btn"
          onClick={() => navigate('/')}
          aria-label="Back"
        >
          <ArrowLeft size={19} />
        </button>

        <h1 className="ios-navbar-title">Profile</h1>

        <button
          className="ios-nav-circle-btn"
          onClick={() => navigate('/shop')}
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="ios-profile-content-container">
        
        {/* User Card Row (Matches Mockup 1 Top) */}
        <div
          className="ios-user-hero-card"
          onClick={() => setShowEditModal(true)}
          role="button"
          tabIndex={0}
        >
          <div className="user-hero-left">
            <div className="ios-avatar-badge">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={userName} className="ios-avatar-img" />
              ) : (
                <div className="ios-avatar-art">
                  <span style={{ fontSize: '1.4rem' }}>👩‍🎨</span>
                </div>
              )}
            </div>
            
            <div className="user-hero-info">
              <h2 className="user-hero-name">{userName}</h2>
              <p className="user-hero-email">{userEmail}</p>
            </div>
          </div>

          <ChevronRight size={18} className="ios-chevron-arrow" />
        </div>

        {/* Upgrade to Pro Dark Obsidian Banner (Matches Mockup 1) */}
        <div className="ios-pro-upgrade-card">
          <div className="pro-card-left">
            <div className="pro-sparkle-badge">
              <Sparkles size={22} className="pro-star-icon" />
            </div>
            <div className="pro-card-text">
              <h3 className="pro-title">Upgrade to Pro</h3>
              <p className="pro-description">
                Unlock shared budgets, AI insights, receipt scanning, and advanced analytics.
              </p>
            </div>
          </div>

          <button
            className="pro-upgrade-btn"
            onClick={() => setShowProModal(true)}
          >
            Upgrade &rsaquo;
          </button>
        </div>

        {/* Group 1: Settings, Subscription, Badges, Linked Cards, Face ID */}
        <div className="ios-card-stack-group">
          
          <div
            className="ios-stack-row"
            onClick={() => setShowEditModal(true)}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <SettingsIcon size={18} className="stack-row-icon" />
              <span>Settings</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div
            className="ios-stack-row"
            onClick={() => setShowProModal(true)}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <CreditCard size={18} className="stack-row-icon" />
              <span>Plan &amp; Subscription</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div
            className="ios-stack-row"
            onClick={() => toastSuccess('Loyalty Badges 🏆', 'You have unlocked Gold Shopper Badge!')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <Award size={18} className="stack-row-icon" />
              <span>Badges</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div
            className="ios-stack-row"
            onClick={() => toastSuccess('Saved Payment Methods 💳', 'UPI & Cards verified for 1-click checkout.')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <Landmark size={18} className="stack-row-icon" />
              <span>My Debit Cards &amp; Linked Banks</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          {/* Interactive iOS Toggle Switch */}
          <div className="ios-stack-row toggle-row">
            <div className="stack-row-left">
              <Lock size={18} className="stack-row-icon" />
              <span>Enable finger Print/Face ID</span>
            </div>
            <label className="ios-switch-wrapper">
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => {
                  setBiometricEnabled(e.target.checked);
                  if (e.target.checked) {
                    toastSuccess('Biometrics Enabled 🔒', 'Face ID / Fingerprint enabled for fast login.');
                  }
                }}
              />
              <span className="ios-switch-slider" />
            </label>
          </div>

        </div>

        {/* Group 2: Preferences, Privacy Policy, Help & Support */}
        <div className="ios-card-stack-group">
          
          <div
            className="ios-stack-row"
            onClick={() => navigate('/account')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <Sliders size={18} className="stack-row-icon" />
              <span>Preferences</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div
            className="ios-stack-row"
            onClick={() => window.open('/privacy', '_blank')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <Shield size={18} className="stack-row-icon" />
              <span>Privacy Policy</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div
            className="ios-stack-row"
            onClick={() => {
              if (onOpenSupport) onOpenSupport();
              else toastSuccess('AI Support Active 🤖', 'Ask questions in the 3D Support Bot anytime.');
            }}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <HelpCircle size={18} className="stack-row-icon" />
              <span>Help &amp; Support</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

        </div>

        {/* Group 3: Feedback, Language, Sign Out */}
        <div className="ios-card-stack-group">
          
          <div
            className="ios-stack-row"
            onClick={() => toastSuccess('Feedback Received 💬', 'Thank you for your rating & feedback!')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <MessageSquare size={18} className="stack-row-icon" />
              <span>Feedback</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div className="ios-stack-row">
            <div className="stack-row-left">
              <Globe size={18} className="stack-row-icon" />
              <span>Language</span>
            </div>
            <div className="stack-row-right-text">
              <span>English</span>
              <ChevronRight size={17} className="ios-chevron-arrow" />
            </div>
          </div>

          {isAdmin && (
            <div
              className="ios-stack-row"
              onClick={() => navigate('/admin')}
              role="button"
              tabIndex={0}
            >
              <div className="stack-row-left">
                <span>👑</span>
                <strong style={{ color: '#F59E0B' }}>Admin Control Center</strong>
              </div>
              <ChevronRight size={17} className="ios-chevron-arrow" />
            </div>
          )}

          {user && (
            <div
              className="ios-stack-row logout-row"
              onClick={() => {
                logout();
                navigate('/');
              }}
              role="button"
              tabIndex={0}
            >
              <div className="stack-row-left">
                <LogOut size={18} color="#EF4444" />
                <span style={{ color: '#EF4444', fontWeight: 800 }}>Sign Out Account</span>
              </div>
              <ChevronRight size={17} className="ios-chevron-arrow" />
            </div>
          )}

        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="ios-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleProfileSave} className="sheet-form">
              <div className="sheet-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="sheet-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="sheet-field">
                <label>Delivery City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="sheet-field">
                <label>Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="sheet-actions">
                <button
                  type="button"
                  className="btn-sheet-secondary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </button>
                <button
                  type="submit"
                  className="btn-sheet-primary"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade to Pro Modal */}
      {showProModal && (
        <div className="ios-modal-overlay" onClick={() => setShowProModal(false)}>
          <div className="ios-modal-sheet pro-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#0066FF" />
                <h3 style={{ margin: 0 }}>AAAN Pro Membership</h3>
              </div>
              <button onClick={() => setShowProModal(false)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="pro-benefits-list">
              <div className="benefit-item">
                <Check size={16} color="#10B981" />
                <span>Unlimited FREE Express Delivery on all 3D Decals</span>
              </div>
              <div className="benefit-item">
                <Check size={16} color="#10B981" />
                <span>AI Interior Room Visualizer &amp; Wall Placement</span>
              </div>
              <div className="benefit-item">
                <Check size={16} color="#10B981" />
                <span>Priority Order Dispatch &amp; VIP Support Hotline</span>
              </div>
              <div className="benefit-item">
                <Check size={16} color="#10B981" />
                <span>Exclusive 20% Member-Only Catalog Discounts</span>
              </div>
            </div>
            <button
              className="btn-sheet-primary"
              onClick={() => {
                toastSuccess('Welcome to Pro! 🌟', 'You have activated AAAN Pro VIP benefits.');
                setShowProModal(false);
              }}
            >
              Activate Pro Membership (₹499/yr)
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="ios-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="sheet-form">
              <div className="sheet-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="sheet-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="sheet-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn-sheet-primary" disabled={pwdSaving}>
                {pwdSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
