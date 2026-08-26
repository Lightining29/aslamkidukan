import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Plus,
  Phone,
  Mail,
  MapPin,
  Camera,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Smartphone,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api';
import { toastSuccess, toastError } from '../../utils/toast.js';
import './ModernUserProfileView.css';

export default function ModernUserProfileView({ onOpenSupport }) {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Active Sub-Page View: 'main' | 'settings' | 'subscription' | 'badges' | 'cards' | 'preferences' | 'privacy' | 'help' | 'feedback' | 'language'
  const [currentView, setCurrentView] = useState('main');

  // Biometric toggle switch state
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Settings State
  const [name, setName] = useState(user?.name || 'Manish Kumar');
  const [phone, setPhone] = useState(user?.phone || '+91 80737 86650');
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('600003');
  const [address, setAddress] = useState(user?.address || '75 Raja Muthiah Road, Periamet');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password State
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  // Preferences State
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('INR');

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('App Experience');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Badges & Coins State
  const [coinsBalance, setCoinsBalance] = useState(850);
  const [redeemedCoins, setRedeemedCoins] = useState(false);

  // Cards & UPI State
  const [savedCards, setSavedCards] = useState([
    { id: 'c1', type: 'upi', label: 'Primary Google Pay / PhonePe', value: 'manish@okaxis', isDefault: true },
    { id: 'c2', type: 'card', label: 'HDFC Platinum Debit Card', value: '•••• •••• •••• 4242', exp: '08/28', isDefault: false }
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');

  // Support FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const userEmail = user?.email || 'customer@aaancart.com';
  const userName = name || user?.name || 'Manish Kumar';

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ name, phone, city, address });
      }
      toastSuccess('Profile Saved! ✨', 'Your address and profile info have been updated.');
      setCurrentView('main');
    } catch (err) {
      toastError('Update Failed', err.message || 'Could not save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Password Update
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toastError('Mismatch', 'Passwords do not match.');
    }
    if (newPassword.length < 6) {
      return toastError('Too Short', 'Password must be at least 6 characters.');
    }
    setPwdSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      toastSuccess('Password Changed! 🔐', 'Your security credentials are updated.');
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toastError('Password Error', err.message || 'Incorrect current password.');
    } finally {
      setPwdSaving(false);
    }
  };

  // Feedback Submit
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    toastSuccess('Feedback Received! 🌟', 'Thank you for helping us improve AAAN Cart.');
    setTimeout(() => {
      setCurrentView('main');
      setFeedbackSubmitted(false);
      setFeedbackText('');
    }, 1200);
  };

  // Redeem Coins
  const handleRedeemCoins = () => {
    if (redeemedCoins) {
      setCoinsBalance(850);
      setRedeemedCoins(false);
      toastSuccess('Coins Restored', 'Coins removed from checkout discount.');
    } else {
      setCoinsBalance(0);
      setRedeemedCoins(true);
      toastSuccess('₹850 Discount Applied! 🪙', 'Coupon code COINS850 applied to your next order.');
    }
  };

  // Add UPI / Card
  const handleAddUpi = (e) => {
    e.preventDefault();
    if (!newUpiId.trim() || !newUpiId.includes('@')) {
      return toastError('Invalid UPI', 'Please enter a valid UPI ID (e.g. name@okhdfcbank).');
    }
    setSavedCards((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, type: 'upi', label: 'Linked UPI ID', value: newUpiId.trim(), isDefault: false }
    ]);
    setNewUpiId('');
    setShowAddCardModal(false);
    toastSuccess('UPI Linked! 💳', 'New payment method added successfully.');
  };

  const handleDeleteCard = (id) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
    toastSuccess('Payment Method Removed', 'Account unlinked.');
  };

  /* =========================================================
     SUB-PAGE: 1. SETTINGS & EDIT PROFILE
     ========================================================= */
  if (currentView === 'settings') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Personal Settings</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          {/* Avatar Edit Header */}
          <div className="settings-avatar-hero">
            <div className="settings-avatar-ring">
              <img
                src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0F172A&color=fff&size=150`}
                alt={userName}
                className="settings-avatar-img"
              />
              <button className="avatar-camera-btn" onClick={() => toastSuccess('Avatar Ready', 'Photo synced from account')}>
                <Camera size={14} color="#FFFFFF" />
              </button>
            </div>
            <h3 className="settings-user-name">{userName}</h3>
            <p className="settings-user-email">{userEmail}</p>
          </div>

          <form onSubmit={handleSaveProfile} className="subpage-form-card">
            <h4 className="form-group-heading">Personal Details</h4>

            <div className="input-field-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="input-field-group">
              <label>Phone Number (WhatsApp Delivery Alerts)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 Phone number"
                required
              />
            </div>

            <h4 className="form-group-heading" style={{ marginTop: '20px' }}>Delivery Address</h4>

            <div className="input-field-group">
              <label>Street Address / Door No / Landmark</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door No, Street Name, Landmark"
                required
              />
            </div>

            <div className="input-two-cols">
              <div className="input-field-group">
                <label>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div className="input-field-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="600001"
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>State</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="State"
                required
              />
            </div>

            <button type="submit" className="subpage-primary-action-btn" disabled={profileSaving}>
              {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>

          {/* Change Password Card */}
          <div className="subpage-form-card" style={{ marginTop: '16px' }}>
            <div
              className="password-toggle-header"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="#0066FF" />
                <h4 className="form-group-heading" style={{ margin: 0 }}>Change Security Password</h4>
              </div>
              <ChevronDown size={18} style={{ transform: showPasswordSection ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {showPasswordSection && (
              <form onSubmit={handleSavePassword} style={{ marginTop: '14px' }}>
                <div className="input-field-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="input-field-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="input-field-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                  />
                </div>

                <button type="submit" className="subpage-secondary-action-btn" disabled={pwdSaving}>
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 2. PLAN & SUBSCRIPTION
     ========================================================= */
  if (currentView === 'subscription') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Plan &amp; Subscription</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          {/* Active VIP Tier Card */}
          <div className="pro-subscription-hero-card">
            <div className="pro-badge-pill">
              <Sparkles size={14} color="#FFE600" />
              <span>ACTIVE VIP PRO</span>
            </div>
            <h3 className="pro-plan-name">AAAN Gold Club</h3>
            <p className="pro-plan-expiry">Valid until August 26, 2027 • Auto-renews yearly</p>

            <div className="pro-perks-checklist">
              <div className="pro-perk-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>20% Extra Member Discount on entire 3D Wall Art Catalog</span>
              </div>
              <div className="pro-perk-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Free 24h Express Air Dispatch on every order</span>
              </div>
              <div className="pro-perk-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Free Doorstep Replacement &amp; 30-Day Hassle-Free Returns</span>
              </div>
              <div className="pro-perk-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Priority 24/7 Dedicated Support &amp; AI Room Visualizer</span>
              </div>
            </div>
          </div>

          {/* Billing & Invoices */}
          <div className="subpage-form-card" style={{ marginTop: '16px' }}>
            <h4 className="form-group-heading">Recent VIP Invoices</h4>
            <div className="invoice-row-item">
              <div>
                <strong>Annual Gold VIP Membership</strong>
                <p className="invoice-subtext">Aug 26, 2026 • UPI #TXN9928174</p>
              </div>
              <span className="invoice-price">₹499.00 <span className="invoice-paid-tag">Paid</span></span>
            </div>
          </div>

          <button
            className="subpage-primary-action-btn"
            style={{ marginTop: '20px' }}
            onClick={() => toastSuccess('Membership Active', 'Your Gold VIP Plan is fully active!')}
          >
            Manage Membership
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 3. BADGES & REWARDS
     ========================================================= */
  if (currentView === 'badges') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Badges &amp; Rewards</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          {/* Coins Balance Hero */}
          <div className="coins-balance-hero-card">
            <div className="coins-title-row">
              <Award size={28} color="#FFE600" />
              <div>
                <span className="coins-label">Total Reward Balance</span>
                <h3 className="coins-amount">{coinsBalance} AAAN Coins</h3>
              </div>
            </div>
            <p className="coins-conversion-text">1 Coin = ₹1.00 Discount on next purchase</p>
            <button className="redeem-coins-action-btn" onClick={handleRedeemCoins}>
              {redeemedCoins ? '✓ ₹850 Applied (Click to remove)' : 'Redeem 850 Coins for ₹850 Off'}
            </button>
          </div>

          {/* Unlocked Badges */}
          <div className="subpage-form-card" style={{ marginTop: '16px' }}>
            <h4 className="form-group-heading">Unlocked Achievement Badges</h4>

            <div className="badge-list-container">
              <div className="badge-card-item is-unlocked">
                <div className="badge-icon-circle gold-circle">🥇</div>
                <div className="badge-info">
                  <strong>Gold VIP Shopper</strong>
                  <p>Awarded for 3+ successful home decor orders</p>
                </div>
                <span className="badge-status-tag">Unlocked</span>
              </div>

              <div className="badge-card-item is-unlocked">
                <div className="badge-icon-circle green-circle">🌿</div>
                <div className="badge-info">
                  <strong>Botanical Art Collector</strong>
                  <p>Decorated home with 3D Botanical Wall Stickers</p>
                </div>
                <span className="badge-status-tag">Unlocked</span>
              </div>

              <div className="badge-card-item is-unlocked">
                <div className="badge-icon-circle blue-circle">💎</div>
                <div className="badge-info">
                  <strong>Verified Reviewer</strong>
                  <p>Shared helpful reviews with photo evidence</p>
                </div>
                <span className="badge-status-tag">Unlocked</span>
              </div>

              <div className="badge-card-item is-locked">
                <div className="badge-icon-circle gray-circle">👑</div>
                <div className="badge-info">
                  <strong>Decor Ambassador</strong>
                  <p>Refer 5 friends to unlock ₹2,000 shopping coupon</p>
                </div>
                <span className="badge-status-tag locked-tag">2/5 Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 4. MY DEBIT CARDS & LINKED BANKS
     ========================================================= */
  if (currentView === 'cards') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Payment Methods</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          <div className="subpage-form-card">
            <h4 className="form-group-heading">Saved 1-Tap Payment Methods</h4>

            <div className="payment-methods-list">
              {savedCards.map((c) => (
                <div key={c.id} className="payment-method-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="pay-method-icon">
                      {c.type === 'upi' ? <Smartphone size={20} color="#0066FF" /> : <CreditCard size={20} color="#10B981" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>{c.label}</strong>
                        {c.isDefault && <span className="default-pill">Default</span>}
                      </div>
                      <p className="pay-subtext">{c.value} {c.exp ? `• Exp ${c.exp}` : ''}</p>
                    </div>
                  </div>
                  <button className="delete-pay-btn" onClick={() => handleDeleteCard(c.id)} aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              className="add-payment-outline-btn"
              onClick={() => setShowAddCardModal(true)}
            >
              <Plus size={16} />
              <span>Link New UPI ID or Card</span>
            </button>
          </div>

          {/* Add Card Modal */}
          {showAddCardModal && (
            <div className="subpage-form-card" style={{ marginTop: '16px', borderColor: '#0066FF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 className="form-group-heading" style={{ margin: 0 }}>Add UPI ID</h4>
                <button onClick={() => setShowAddCardModal(false)} style={{ background: 'none', border: 'none' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddUpi}>
                <div className="input-field-group">
                  <label>UPI ID (Google Pay / PhonePe / Paytm)</label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    required
                  />
                </div>
                <button type="submit" className="subpage-primary-action-btn">
                  Verify &amp; Link UPI
                </button>
              </form>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div className="security-notice-pill">
            <ShieldCheck size={16} color="#10B981" />
            <span>256-bit encrypted. We never store CVV or bank passwords.</span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 5. PREFERENCES
     ========================================================= */
  if (currentView === 'preferences') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Preferences</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          <div className="subpage-form-card">
            <h4 className="form-group-heading">Notifications &amp; Alerts</h4>

            <div className="preference-toggle-row">
              <div>
                <strong>WhatsApp Order Tracking</strong>
                <p className="pref-subtext">Receive real-time tracking links &amp; out-for-delivery alerts</p>
              </div>
              <label className="ios-toggle-switch">
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => {
                    setWhatsappAlerts(e.target.checked);
                    toastSuccess('Saved', 'WhatsApp preferences updated.');
                  }}
                />
                <span className="ios-toggle-slider" />
              </label>
            </div>

            <div className="preference-toggle-row">
              <div>
                <strong>SMS Dispatch Notifications</strong>
                <p className="pref-subtext">SMS alerts when order leaves fulfillment center</p>
              </div>
              <label className="ios-toggle-switch">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => {
                    setSmsAlerts(e.target.checked);
                    toastSuccess('Saved', 'SMS preferences updated.');
                  }}
                />
                <span className="ios-toggle-slider" />
              </label>
            </div>

            <div className="preference-toggle-row">
              <div>
                <strong>Promotional Newsletters &amp; Offers</strong>
                <p className="pref-subtext">Weekly drops, flash sales, and clearance discounts</p>
              </div>
              <label className="ios-toggle-switch">
                <input
                  type="checkbox"
                  checked={promoEmails}
                  onChange={(e) => {
                    setPromoEmails(e.target.checked);
                    toastSuccess('Saved', 'Email preferences updated.');
                  }}
                />
                <span className="ios-toggle-slider" />
              </label>
            </div>
          </div>

          <div className="subpage-form-card" style={{ marginTop: '16px' }}>
            <h4 className="form-group-heading">Currency Display</h4>
            <div className="currency-selector-row">
              <button
                className={`currency-chip ${currency === 'INR' ? 'active' : ''}`}
                onClick={() => {
                  setCurrency('INR');
                  toastSuccess('Currency set to Indian Rupee (₹)');
                }}
              >
                ₹ INR (India)
              </button>
              <button
                className={`currency-chip ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => {
                  setCurrency('USD');
                  toastSuccess('Currency set to USD ($)');
                }}
              >
                $ USD (Global)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 6. PRIVACY POLICY & SECURITY
     ========================================================= */
  if (currentView === 'privacy') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Privacy Policy</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          <div className="subpage-form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={24} color="#10B981" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Your Privacy is 100% Protected</h3>
            </div>

            <p className="privacy-body-p">
              At <strong>AAAN Cart</strong>, we prioritize the protection of your personal information. We never sell, rent, or trade your contact or delivery details to third parties.
            </p>

            <h4 className="privacy-subheading">1. Data Encryption &amp; Storage</h4>
            <p className="privacy-body-p">
              All transactions and profile data are protected via industry-standard 256-Bit SSL TLS encryption. Payment processing is tokenized directly via Razorpay/Stripe compliant gateways.
            </p>

            <h4 className="privacy-subheading">2. Delivery Coordination</h4>
            <p className="privacy-body-p">
              Your name, delivery address, and phone number are only shared with our verified courier partners (Delhivery, BlueDart, Xpressbees) to ensure timely doorstep delivery.
            </p>

            <h4 className="privacy-subheading">3. 30-Day Money-Back Guarantee</h4>
            <p className="privacy-body-p">
              If your 3D Wall Stickers or Decals arrive damaged or don't match your expectations, we offer free doorstep replacement or 100% instant refund within 30 days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 7. HELP & SUPPORT
     ========================================================= */
  if (currentView === 'help') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Help &amp; Support</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          {/* Support Actions Grid */}
          <div className="support-actions-grid">
            <div
              className="support-action-card"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
                if (onOpenSupport) onOpenSupport();
              }}
            >
              <div className="support-icon-pod" style={{ background: '#EEF2FF' }}>
                <Sparkles size={20} color="#0066FF" />
              </div>
              <strong>3D AI Support Bot</strong>
              <p>Instant answers on tracking &amp; returns</p>
            </div>

            <a
              href="https://wa.me/918073786650?text=Hi%20AAAN%20Cart,%20I%20need%20help%20with%20my%20order"
              target="_blank"
              rel="noreferrer"
              className="support-action-card"
            >
              <div className="support-icon-pod" style={{ background: '#ECFDF5' }}>
                <MessageSquare size={20} color="#10B981" />
              </div>
              <strong>WhatsApp Support</strong>
              <p>Chat live with verified support</p>
            </a>

            <a href="tel:+918073786650" className="support-action-card">
              <div className="support-icon-pod" style={{ background: '#FEF3C7' }}>
                <Phone size={20} color="#D97706" />
              </div>
              <strong>Call Hotline</strong>
              <p>+91 80737 86650</p>
            </a>

            <div
              className="support-action-card"
              onClick={() => navigate('/contact')}
            >
              <div className="support-icon-pod" style={{ background: '#F3E8FF' }}>
                <Mail size={20} color="#7C3AED" />
              </div>
              <strong>Submit Ticket</strong>
              <p>Priority email resolution</p>
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div className="subpage-form-card" style={{ marginTop: '16px' }}>
            <h4 className="form-group-heading">Frequently Asked Questions</h4>

            {[
              { q: 'How long does delivery take across India?', a: 'Standard orders dispatch in 24 hours and arrive in 3-5 business days. Gold VIP members receive Express 48h delivery.' },
              { q: 'Are the 3D wall stickers removable and reusable?', a: 'Yes! Our premium acrylic & vinyl adhesive leaves zero residue on painted walls, tiles, glass, or wooden surfaces.' },
              { q: 'How do I request a return or replacement?', a: 'Tap the 3D AI Support Bot or message us on WhatsApp with your Order ID for instant doorstep replacement.' }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="faq-accordion-item"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              >
                <div className="faq-q-line">
                  <strong>{faq.q}</strong>
                  <ChevronDown size={16} style={{ transform: openFaqIndex === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {openFaqIndex === idx && <p className="faq-a-text">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 8. FEEDBACK & SUGGESTIONS
     ========================================================= */
  if (currentView === 'feedback') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Share Feedback</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          <form onSubmit={handleFeedbackSubmit} className="subpage-form-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 900 }}>How was your experience?</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Your review helps us craft better 3D wall decor</p>
            </div>

            {/* 5-Star Interactive Selector */}
            <div className="star-rating-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="star-rating-btn"
                  onClick={() => setFeedbackRating(s)}
                >
                  <Star
                    size={32}
                    color="#FFD700"
                    fill={s <= feedbackRating ? '#FFD700' : 'none'}
                  />
                </button>
              ))}
            </div>

            {/* Category Chips */}
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>
              Feedback Category
            </label>
            <div className="feedback-chips-row">
              {['App Experience', 'Product Quality', 'Delivery Speed', 'Customer Support'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`feedback-chip ${feedbackCategory === cat ? 'active' : ''}`}
                  onClick={() => setFeedbackCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="input-field-group" style={{ marginTop: '16px' }}>
              <label>Your Comments &amp; Suggestions</label>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you loved or how we can improve..."
                required
              />
            </div>

            <button type="submit" className="subpage-primary-action-btn">
              {feedbackSubmitted ? 'Thank You!' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUB-PAGE: 9. LANGUAGE SELECTION
     ========================================================= */
  if (currentView === 'language') {
    return (
      <div className="subpage-view-wrapper">
        <div className="subpage-top-nav-bar">
          <button className="subpage-back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="subpage-title">Language</h2>
          <div className="subpage-spacer" />
        </div>

        <div className="subpage-content-scroll">
          <div className="subpage-form-card">
            <h4 className="form-group-heading">Select App Language</h4>

            {[
              { label: 'English', sub: 'Default' },
              { label: 'हिन्दी (Hindi)', sub: 'भारत' },
              { label: 'தமிழ் (Tamil)', sub: 'தமிழ்நாடு' },
              { label: 'తెలుగు (Telugu)', sub: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
              { label: 'മലയാളം (Malayalam)', sub: 'കേരളം' }
            ].map((lang) => (
              <div
                key={lang.label}
                className={`language-option-row ${selectedLanguage === lang.label ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedLanguage(lang.label);
                  toastSuccess('Language Updated', `App language set to ${lang.label}`);
                  setTimeout(() => setCurrentView('main'), 300);
                }}
              >
                <div>
                  <strong>{lang.label}</strong>
                  <p className="lang-subtext">{lang.sub}</p>
                </div>
                {selectedLanguage === lang.label && <Check size={18} color="#0066FF" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN VIEW (Exact Match to User's Uploaded Image 2)
     ========================================================= */
  return (
    <div className="modern-user-profile-page">
      <div className="modern-user-profile-container">

        {/* Top Header Bar with Back Button */}
        <div className="profile-app-top-bar">
          <button
            className="profile-top-back-btn"
            onClick={() => navigate('/')}
            aria-label="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="profile-app-title">Profile</h1>
          <div className="profile-top-spacer" />
        </div>

        {/* User Card */}
        <div className="user-profile-identity-card">
          <div className="profile-avatar-circle">
            <img
              src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0F172A&color=fff&size=150`}
              alt={userName}
              className="profile-real-img"
            />
          </div>
          <div className="profile-identity-details">
            <h2 className="profile-real-name">{userName}</h2>
            <p className="profile-real-meta">{phone || '+91 80737 86650'}</p>
            <p className="profile-real-meta email-meta">{userEmail}</p>
          </div>
        </div>

        {/* SECTION 1: SETTINGS, PLAN, BADGES, CARDS, BIOMETRIC */}
        <div className="profile-menu-section-card">
          
          {/* Row 1: Settings */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('settings')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <SettingsIcon size={18} className="menu-row-icon" />
              <span className="menu-row-label">Settings</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 2: Plan & Subscription */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('subscription')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <CreditCard size={18} className="menu-row-icon" />
              <span className="menu-row-label">Plan &amp; Subscription</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 3: Badges */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('badges')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <Award size={18} className="menu-row-icon" />
              <span className="menu-row-label">Badges</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 4: My Debit Cards & Linked Banks */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('cards')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <Landmark size={18} className="menu-row-icon" />
              <span className="menu-row-label">My Debit Cards &amp; Linked Banks</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 5: Enable finger Print/Face ID */}
          <div className="profile-menu-row no-border">
            <div className="menu-row-left">
              <Lock size={18} className="menu-row-icon" />
              <span className="menu-row-label">Enable finger Print/Face ID</span>
            </div>
            <label className="ios-toggle-switch">
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => {
                  setBiometricEnabled(e.target.checked);
                  toastSuccess(
                    e.target.checked ? 'Biometrics Enabled 🔒' : 'Biometrics Disabled',
                    e.target.checked ? 'Fingerprint & FaceID active for 1-tap login.' : 'Standard password required.'
                  );
                }}
              />
              <span className="ios-toggle-slider" />
            </label>
          </div>

        </div>

        {/* SECTION 2: PREFERENCES, PRIVACY POLICY, HELP & SUPPORT */}
        <div className="profile-menu-section-card">
          
          {/* Row 6: Preferences */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('preferences')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <Sliders size={18} className="menu-row-icon" />
              <span className="menu-row-label">Preferences</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 7: Privacy Policy */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('privacy')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <Shield size={18} className="menu-row-icon" />
              <span className="menu-row-label">Privacy Policy</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 8: Help & Support */}
          <div
            className="profile-menu-row no-border"
            onClick={() => setCurrentView('help')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <HelpCircle size={18} className="menu-row-icon" />
              <span className="menu-row-label">Help &amp; Support</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

        </div>

        {/* SECTION 3: FEEDBACK, LANGUAGE */}
        <div className="profile-menu-section-card">
          
          {/* Row 9: Feedback */}
          <div
            className="profile-menu-row"
            onClick={() => setCurrentView('feedback')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <MessageSquare size={18} className="menu-row-icon" />
              <span className="menu-row-label">Feedback</span>
            </div>
            <ChevronRight size={18} className="menu-row-chevron" />
          </div>

          {/* Row 10: Language */}
          <div
            className="profile-menu-row no-border"
            onClick={() => setCurrentView('language')}
            role="button"
            tabIndex={0}
          >
            <div className="menu-row-left">
              <Globe size={18} className="menu-row-icon" />
              <span className="menu-row-label">Language</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>{selectedLanguage}</span>
              <ChevronRight size={18} className="menu-row-chevron" />
            </div>
          </div>

        </div>

        {/* Sign Out Button */}
        <button
          className="profile-logout-button"
          onClick={() => {
            if (logout) logout();
            navigate('/');
            toastSuccess('Signed Out', 'You have been logged out.');
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>

      </div>
    </div>
  );
}
