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
  Check,
  Star,
  Bell,
  Truck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api';
import { toastSuccess, toastError } from '../../utils/toast.js';
import './ModernUserProfileView.css';

export default function ModernUserProfileView({ onOpenSupport }) {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Active Modals
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile', 'pro', 'badges', 'cards', 'preferences', 'privacy', 'feedback', 'language', 'password'

  // Biometric toggle switch state
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || 'Manish Kumar');
  const [phone, setPhone] = useState(user?.phone || '+91 80737 86650');
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [address, setAddress] = useState(user?.address || '75 Raja Muthiah Road, Periamet');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Preferences State
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  // Language State
  const [selectedLang, setSelectedLang] = useState('English');

  const userEmail = user?.email || 'customer@aaancart.com';
  const userName = user?.name || 'Manish Kumar';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ name, phone, city, address });
      }
      toastSuccess('Profile updated! ✨', 'Your account details have been saved.');
      setActiveModal(null);
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
      setActiveModal(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toastError('Password error', err.message);
    } finally {
      setPwdSaving(false);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    toastSuccess('Feedback Submitted! 🌟', 'Thank you for helping us improve AAAN Cart.');
    setActiveModal(null);
    setFeedbackText('');
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
          onClick={() => setActiveModal('edit_profile')}
          role="button"
          tabIndex={0}
        >
          <div className="user-hero-left">
            <div className="ios-avatar-badge">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={userName} className="ios-avatar-img" />
              ) : (
                <div className="ios-avatar-art">
                  <span style={{ fontSize: '1.4rem' }}>👨‍🎨</span>
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
            onClick={() => setActiveModal('pro')}
          >
            Upgrade &rsaquo;
          </button>
        </div>

        {/* Group 1: Settings, Subscription, Badges, Linked Cards, Face ID */}
        <div className="ios-card-stack-group">
          
          <div
            className="ios-stack-row"
            onClick={() => setActiveModal('edit_profile')}
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
            onClick={() => setActiveModal('pro')}
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
            onClick={() => setActiveModal('badges')}
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
            onClick={() => setActiveModal('cards')}
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
            onClick={() => setActiveModal('preferences')}
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
            onClick={() => setActiveModal('privacy')}
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

        {/* Group 3: Feedback, Language, Admin, Sign Out */}
        <div className="ios-card-stack-group">
          
          <div
            className="ios-stack-row"
            onClick={() => setActiveModal('feedback')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <MessageSquare size={18} className="stack-row-icon" />
              <span>Feedback</span>
            </div>
            <ChevronRight size={17} className="ios-chevron-arrow" />
          </div>

          <div
            className="ios-stack-row"
            onClick={() => setActiveModal('language')}
            role="button"
            tabIndex={0}
          >
            <div className="stack-row-left">
              <Globe size={18} className="stack-row-icon" />
              <span>Language</span>
            </div>
            <div className="stack-row-right-text">
              <span>{selectedLang}</span>
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
                <strong style={{ color: '#D97706' }}>Admin Control Center</strong>
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

      {/* =========================================================
          MODALS & SHEETS (CENTERED & 100% VISIBLE ABOVE BOTTOM NAV)
          ========================================================= */}

      {/* 1. Edit Profile Modal */}
      {activeModal === 'edit_profile' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Edit Profile</h3>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn" aria-label="Close">
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
                  placeholder="Your Full Name"
                  required
                />
              </div>

              <div className="sheet-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="sheet-field">
                <label>Delivery City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>

              <div className="sheet-field">
                <label>Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No, Street, Locality"
                />
              </div>

              <div className="sheet-actions">
                <button
                  type="button"
                  className="btn-sheet-secondary"
                  onClick={() => setActiveModal('password')}
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

      {/* 2. Upgrade to Pro Modal */}
      {activeModal === 'pro' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet pro-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} color="#0066FF" />
                <h3 style={{ margin: 0 }}>AAAN Pro Membership</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn" aria-label="Close">
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
                setActiveModal(null);
              }}
            >
              Activate Pro Membership (₹499/yr)
            </button>
          </div>
        </div>
      )}

      {/* 3. Badges & Rewards Modal */}
      {activeModal === 'badges' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={22} color="#F59E0B" />
                <h3 style={{ margin: 0 }}>My Badges &amp; Coins</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="pro-benefits-list">
              <div className="benefit-item">
                <span style={{ fontSize: '1.4rem' }}>🥇</span>
                <div>
                  <strong>Gold VIP Shopper</strong>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>Unlocked after 3 completed purchases</p>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{ fontSize: '1.4rem' }}>🌿</span>
                <div>
                  <strong>Eco-Friendly Wall Decorator</strong>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>Botanical stickers collector</p>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{ fontSize: '1.4rem' }}>🪙</span>
                <div>
                  <strong>850 AAAN Coins Balance</strong>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>Worth ₹850 discount on your next checkout</p>
                </div>
              </div>
            </div>

            <button className="btn-sheet-primary" onClick={() => setActiveModal(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* 4. Saved Payment Cards & UPI Modal */}
      {activeModal === 'cards' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={20} color="#0066FF" />
                <h3 style={{ margin: 0 }}>Saved Payment Methods</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="pro-benefits-list">
              <div className="benefit-item">
                <span style={{ fontSize: '1.4rem' }}>💳</span>
                <div style={{ flex: 1 }}>
                  <strong>UPI ID: {userEmail?.split('@')[0]}@okaxis</strong>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>Verified for Instant 1-Tap Checkout</p>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{ fontSize: '1.4rem' }}>🏛️</span>
                <div style={{ flex: 1 }}>
                  <strong>HDFC / ICICI Net Banking Linked</strong>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>Razorpay 256-bit Encrypted</p>
                </div>
              </div>
            </div>

            <button
              className="btn-sheet-secondary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => toastSuccess('Add New Card', 'Enter card details at checkout to save securely.')}
            >
              <Plus size={16} /> Add New UPI / Card
            </button>
          </div>
        </div>
      )}

      {/* 5. Preferences Modal */}
      {activeModal === 'preferences' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="#0066FF" />
                <h3 style={{ margin: 0 }}>Notification Preferences</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="pro-benefits-list">
              <div className="benefit-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={18} color="#64748B" />
                  <span>WhatsApp Order Tracking</span>
                </div>
                <label className="ios-switch-wrapper">
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  />
                  <span className="ios-switch-slider" />
                </label>
              </div>

              <div className="benefit-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={18} color="#64748B" />
                  <span>SMS Dispatch Alerts</span>
                </div>
                <label className="ios-switch-wrapper">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                  />
                  <span className="ios-switch-slider" />
                </label>
              </div>

              <div className="benefit-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="#64748B" />
                  <span>Exclusive Deals &amp; Drops</span>
                </div>
                <label className="ios-switch-wrapper">
                  <input
                    type="checkbox"
                    checked={promoEmails}
                    onChange={(e) => setPromoEmails(e.target.checked)}
                  />
                  <span className="ios-switch-slider" />
                </label>
              </div>
            </div>

            <button
              className="btn-sheet-primary"
              onClick={() => {
                toastSuccess('Preferences Saved! ✅', 'Notification settings updated.');
                setActiveModal(null);
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 6. Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#10B981" />
                <h3 style={{ margin: 0 }}>Privacy &amp; Security</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p><strong>🔒 256-Bit SSL Encryption:</strong> All transactions and account credentials are encrypted with bank-grade security protocols.</p>
              <p><strong>🛡️ 30-Day Guarantee:</strong> Easy doorstep returns and instant refunds on all 3D Wall Decor orders.</p>
              <p><strong>🍪 Zero Data Sharing:</strong> We never sell or share your personal address or payment details with third parties.</p>
            </div>

            <button className="btn-sheet-primary" style={{ marginTop: '16px' }} onClick={() => setActiveModal(null)}>
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* 7. Feedback Modal */}
      {activeModal === 'feedback' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} color="#0066FF" />
                <h3 style={{ margin: 0 }}>Rate &amp; Feedback</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="sheet-form">
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '8px 0 14px' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setRating(num)}
                  >
                    <Star
                      size={28}
                      color={num <= rating ? '#F59E0B' : '#CBD5E1'}
                      fill={num <= rating ? '#F59E0B' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <div className="sheet-field">
                <label>Your Feedback / Suggestions</label>
                <textarea
                  rows={3}
                  placeholder="How can we make your shopping experience better?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '14px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <button type="submit" className="btn-sheet-primary">
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Language Modal */}
      {activeModal === 'language' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} color="#0066FF" />
                <h3 style={{ margin: 0 }}>Select Language</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="pro-benefits-list">
              {[
                { name: 'English', native: 'English' },
                { name: 'Hindi', native: 'हिन्दी' },
                { name: 'Tamil', native: 'தமிழ்' },
                { name: 'Telugu', native: 'తెలుగు' }
              ].map((lang) => (
                <div
                  key={lang.name}
                  className="benefit-item"
                  style={{
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: selectedLang === lang.name ? '#EFF6FF' : 'transparent'
                  }}
                  onClick={() => {
                    setSelectedLang(lang.name);
                    toastSuccess('Language Updated', `Switched to ${lang.name}`);
                    setActiveModal(null);
                  }}
                >
                  <div>
                    <strong>{lang.name}</strong>
                    <span style={{ marginLeft: '6px', color: '#64748B', fontSize: '0.8rem' }}>({lang.native})</span>
                  </div>
                  {selectedLang === lang.name && <Check size={18} color="#0066FF" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. Password Modal */}
      {activeModal === 'password' && (
        <div className="ios-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ios-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Change Password</h3>
              <button onClick={() => setActiveModal(null)} className="sheet-close-btn">
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
