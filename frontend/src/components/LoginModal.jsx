import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, resetPassword, changePassword, verifyOtp, resendOtp } from '../api';
import GoogleSignInButton from './GoogleSignInButton';
import { toastSuccess, toastError, toastInfo } from '../utils/toast.js';
import './LoginModal.css';

export default function LoginModal({ onClose, initialMode = 'login' }) {
  const {
    login,
    register,
    loginWithGoogle,
    requirePasswordSetup,
    setRequirePasswordSetup
  } = useAuth();
  const navigate = useNavigate();

  // Modes: 'login', 'register', 'verify_otp', 'create_password', 'forgot_email', 'forgot_verify', 'google_processing'
  const [mode, setMode] = useState(requirePasswordSetup ? 'create_password' : initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Connecting to Google…');
  const [shaking, setShaking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const triggerError = (msg) => {
    setError(msg);
    setShaking(false);
    requestAnimationFrame(() => {
      setShaking(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([80, 40, 80]); } catch {}
      }
    });
    setTimeout(() => setShaking(false), 600);
  };

  useEffect(() => {
    if (requirePasswordSetup) {
      setMode('create_password');
    }
  }, [requirePasswordSetup]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleClose = () => {
    setRequirePasswordSetup(false);
    if (onClose) onClose();
  };

  const handleRedirect = (u) => {
    handleClose();
    if (u) {
      const dest = (u.role === 'admin' || u.isAdmin) ? '/admin' : '/account';
      navigate(dest);
    }
  };

  // Google Login Processing Flow
  const handleGoogleSuccess = async (credential) => {
    setError('');
    setMessage('');
    setMode('google_processing');
    setProcessingStatus('Verifying Google Account…');

    try {
      setTimeout(() => setProcessingStatus('Authenticating Credentials…'), 600);
      setTimeout(() => setProcessingStatus('Configuring Your Dashboard…'), 1200);

      const res = await loginWithGoogle(credential);

      setTimeout(() => {
        if (res?.requirePasswordSetup) {
          toastSuccess('Google Verified! 🌟', 'Create a password for multi-device access.');
          setMode('create_password');
        } else {
          toastSuccess('Welcome to AAAN Cart! 👋', `Signed in as ${res?.name || 'Customer'}`);
          handleRedirect(res);
        }
      }, 1600);
    } catch (err) {
      setMode('login');
      triggerError(err?.message || 'Google Sign-In failed. Please try again.');
    }
  };

  const handleGoogleError = (err) => {
    triggerError(err?.message || 'Google authentication encountered an issue.');
  };

  // 1. Manual Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const u = await login(email, password);
      toastSuccess('Welcome Back! 👋', `Signed in as ${u.name}`);
      handleRedirect(u);
    } catch (err) {
      triggerError(err?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Manual Signup Submit (Sends OTP via Brevo)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return triggerError('Password must be at least 6 characters.');
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await register(name, email, password);
      if (res?.requireVerification) {
        toastInfo('OTP Sent 📩', 'Check your email inbox for your 6-digit verification code.');
        setMode('verify_otp');
        setResendCooldown(60);
      } else {
        toastSuccess('Account Created! 🎉', `Welcome to AAAN Cart, ${res.name}!`);
        handleRedirect(res);
      }
    } catch (err) {
      triggerError(err?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP Submit
  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      return triggerError('Please enter the full 6-digit OTP code.');
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, otpCode, password);
      toastSuccess('Email Verified! ✅', `Welcome to AAAN Cart, ${res?.user?.name || name || 'Customer'}!`);
      handleRedirect(res?.user);
    } catch (err) {
      triggerError(err?.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await resendOtp(email);
      toastSuccess('New OTP Dispatched 📩', 'Check your email inbox (sent via Brevo).');
      setResendCooldown(60);
    } catch (err) {
      triggerError(err?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Create Password (for first-time Google sign-in)
  const handleCreatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return triggerError('Password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return triggerError('Passwords do not match. Please re-enter.');
    }
    setError('');
    setLoading(true);

    try {
      await changePassword(newPassword);
      toastSuccess('Password Saved! 🔒', 'Your account is fully secured.');
      setRequirePasswordSetup(false);
      handleRedirect();
    } catch (err) {
      triggerError(err?.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Forgot Password: Send OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await forgotPassword(email);
      toastInfo('Reset Code Sent 📩', 'Check your email for the 6-digit password reset code.');
      setMode('forgot_verify');
      setResendCooldown(60);
    } catch (err) {
      triggerError(err?.message || 'Could not send reset code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Forgot Password: Verify & Reset
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return triggerError('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return triggerError('Passwords do not match. Please re-enter.');
    }
    setError('');
    setLoading(true);

    try {
      await resetPassword(email, otpCode, newPassword);
      toastSuccess('Password Reset! 🎉', 'You can now sign in with your new password.');
      setMode('login');
      setPassword('');
      setMessage('Password updated successfully! Please sign in.');
    } catch (err) {
      triggerError(err?.message || 'Invalid or expired reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div
        className={`login-modal-card ${shaking ? 'is-shaking' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close">
          <X size={19} />
        </button>

        {/* Brand Header */}
        <div className="modal-brand-header">
          <div className="modal-brand-icon">🌿</div>
          <h2 className="modal-brand-title">AAAN CART</h2>
        </div>

        {/* =========================================================
            1. GOOGLE AUTH ANIMATED PROCESSING STATE
            ========================================================= */}
        {mode === 'google_processing' && (
          <div className="google-processing-container">
            <div className="google-spinner-wrap">
              <div className="google-orbit-ring" />
              <svg className="google-g-logo" viewBox="0 0 24 24" width="32" height="32">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <h3 className="processing-title">{processingStatus}</h3>
            <p className="processing-desc">Securing session with 256-bit encryption…</p>
          </div>
        )}

        {/* =========================================================
            2. CREATE / SETUP PASSWORD MODAL (First-Time Google / Unset)
            ========================================================= */}
        {mode === 'create_password' && (
          <div className="auth-view-block">
            <div className="step-icon-badge">
              <KeyRound size={24} color="#0066FF" />
            </div>
            <h3 className="modal-view-title">Create Your Password</h3>
            <p className="modal-view-subtitle">
              Set a password so you can sign in directly from any phone or browser.
            </p>

            {error && <div className="modal-error-box">{error}</div>}

            <form onSubmit={handleCreatePasswordSubmit} className="modal-auth-form">
              <div className="input-field-group">
                <label>New Password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-modal-primary" disabled={loading}>
                {loading ? 'Saving Password…' : 'Save Password & Go to Dashboard'}
              </button>

              <button
                type="button"
                className="btn-modal-skip"
                onClick={() => handleRedirect()}
              >
                Skip for now &rsaquo;
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            3. VERIFY OTP MODAL (Signup Email Verification via Brevo)
            ========================================================= */}
        {mode === 'verify_otp' && (
          <div className="auth-view-block">
            <div className="step-icon-badge emerald">
              <Mail size={24} color="#10B981" />
            </div>
            <h3 className="modal-view-title">Verify Your Email</h3>
            <p className="modal-view-subtitle">
              Enter the 6-digit code sent to <strong>{email}</strong> (via Brevo).
            </p>

            {error && <div className="modal-error-box">{error}</div>}
            {message && <div className="modal-success-box">{message}</div>}

            <form onSubmit={handleOtpVerifySubmit} className="modal-auth-form">
              <div className="input-field-group">
                <label>6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="otp-center-input"
                  required
                />
              </div>

              <button type="submit" className="btn-modal-primary" disabled={loading}>
                {loading ? 'Verifying Code…' : 'Verify & Enter Dashboard'}
              </button>

              <div className="otp-resend-row">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================
            4. FORGOT PASSWORD (STEP 1: ENTER EMAIL)
            ========================================================= */}
        {mode === 'forgot_email' && (
          <div className="auth-view-block">
            <div className="step-icon-badge">
              <KeyRound size={24} color="#0066FF" />
            </div>
            <h3 className="modal-view-title">Reset Password</h3>
            <p className="modal-view-subtitle">
              Enter your account email and we'll send a 6-digit reset code via Brevo.
            </p>

            {error && <div className="modal-error-box">{error}</div>}

            <form onSubmit={handleForgotSendOtp} className="modal-auth-form">
              <div className="input-field-group">
                <label>Account Email</label>
                <div className="input-icon-wrap">
                  <Mail size={17} className="field-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-modal-primary" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send 6-Digit Reset Code'}
              </button>

              <button
                type="button"
                className="btn-modal-back"
                onClick={() => { setMode('login'); setError(''); }}
              >
                &lsaquo; Back to Sign In
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            5. FORGOT PASSWORD (STEP 2: VERIFY CODE & SET NEW PASSWORD)
            ========================================================= */}
        {mode === 'forgot_verify' && (
          <div className="auth-view-block">
            <div className="step-icon-badge">
              <Lock size={24} color="#0066FF" />
            </div>
            <h3 className="modal-view-title">Set New Password</h3>
            <p className="modal-view-subtitle">
              Enter the reset code sent to <strong>{email}</strong> and your new password.
            </p>

            {error && <div className="modal-error-box">{error}</div>}

            <form onSubmit={handleForgotResetSubmit} className="modal-auth-form">
              <div className="input-field-group">
                <label>6-Digit Reset Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="otp-center-input"
                  required
                />
              </div>

              <div className="input-field-group">
                <label>New Password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>Confirm New Password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-modal-primary" disabled={loading}>
                {loading ? 'Resetting Password…' : 'Reset Password & Sign In'}
              </button>

              <button
                type="button"
                className="btn-modal-back"
                onClick={() => { setMode('login'); setError(''); }}
              >
                &lsaquo; Cancel
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            6. SIGN IN / LOGIN TAB
            ========================================================= */}
        {mode === 'login' && (
          <div className="auth-view-block">
            
            {/* Segmented Switcher */}
            <div className="auth-tab-switcher">
              <button
                type="button"
                className="tab-switch-btn active"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="tab-switch-btn"
                onClick={() => { setMode('register'); setError(''); setMessage(''); }}
              >
                Create Account
              </button>
            </div>

            {error && <div className="modal-error-box">{error}</div>}
            {message && <div className="modal-success-box">{message}</div>}

            <form onSubmit={handleLoginSubmit} className="modal-auth-form">
              <div className="input-field-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={17} className="field-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <div className="field-label-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="forgot-pass-link"
                    onClick={() => { setMode('forgot_email'); setError(''); setMessage(''); }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-icon-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-modal-primary" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In to AAAN Cart'}
              </button>
            </form>

            <div className="auth-or-divider">
              <span>or continue with</span>
            </div>

            {/* Google Sign In Button */}
            <div className="google-btn-container">
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
              />
            </div>
          </div>
        )}

        {/* =========================================================
            7. REGISTER / SIGNUP TAB
            ========================================================= */}
        {mode === 'register' && (
          <div className="auth-view-block">
            
            {/* Segmented Switcher */}
            <div className="auth-tab-switcher">
              <button
                type="button"
                className="tab-switch-btn"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="tab-switch-btn active"
                onClick={() => { setMode('register'); setError(''); setMessage(''); }}
              >
                Create Account
              </button>
            </div>

            {error && <div className="modal-error-box">{error}</div>}
            {message && <div className="modal-success-box">{message}</div>}

            <form onSubmit={handleSignupSubmit} className="modal-auth-form">
              <div className="input-field-group">
                <label>Full Name</label>
                <div className="input-icon-wrap">
                  <User size={17} className="field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Manish Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={17} className="field-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>Create Password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-modal-primary" disabled={loading}>
                {loading ? 'Sending Verification OTP…' : 'Create Account & Send OTP'}
              </button>
            </form>

            <div className="auth-or-divider">
              <span>or sign up with</span>
            </div>

            {/* Google Sign Up Button */}
            <div className="google-btn-container">
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
