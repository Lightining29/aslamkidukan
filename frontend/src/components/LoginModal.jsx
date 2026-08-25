import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, resetPassword, changePassword } from '../api';
import GoogleSignInButton from './GoogleSignInButton';
import { toastSuccess, toastError, toastInfo } from '../utils/toast.js';
import './LoginModal.css';

export default function LoginModal({ onClose, initialMode = 'login' }) {
  const { login, register, loginWithGoogle, requirePasswordSetup, setRequirePasswordSetup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(requirePasswordSetup ? 'setup-password' : initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const triggerError = (msg) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 550);
  };

  useEffect(() => {
    if (requirePasswordSetup) {
      setMode('setup-password');
    }
  }, [requirePasswordSetup]);

  const handleClose = () => {
    setRequirePasswordSetup(false);
    onClose();
  };

  const handleRedirect = (u) => {
    handleClose();
    if (u) {
      const dest = (u.role === 'admin' || u.isAdmin) ? '/admin' : '/account';
      navigate(dest);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const u = await loginWithGoogle(credential);
      toastSuccess('Welcome!', `Signed in as ${u.name}`);
      handleRedirect(u);
    } catch (err) {
      triggerError(err?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    triggerError(err?.message || 'Google Sign-In failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const u = await login(email, password);
        toastSuccess('Welcome back!', `Signed in as ${u.name}`);
        handleRedirect(u);
      } else if (mode === 'register') {
        const u = await register(name, email, password);
        toastSuccess('Account created!', `Welcome to AAAN Cart, ${u.name}!`);
        handleRedirect(u);
      }
    } catch (err) {
      triggerError(err?.message || (mode === 'login' ? 'Wrong password or email. Please check your credentials.' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage('Verification code sent to your email.');
      toastInfo('OTP Sent', 'Check your email for the reset code');
      setForgotStep(2);
    } catch (err) {
      triggerError(err?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      toastSuccess('Password Reset', 'You can now sign in with your new password.');
      setMode('login');
      setForgotStep(1);
      setPassword('');
      setMessage('Password reset successfully! Please sign in.');
    } catch (err) {
      triggerError(err?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await changePassword(newPassword);
      toastSuccess('Password Created', 'Your password has been saved.');
      setRequirePasswordSetup(false);
      handleClose();
    } catch (err) {
      triggerError(err?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className={`login-modal-card ${shaking ? 'is-shaking' : ''}`} onClick={handleModalClick}>
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-logo">
          <span style={{ fontSize: '1.6rem' }}>🌿</span> AAAN Cart
        </div>

        {/* Segmented Auth Mode Switcher (Login / Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="modal-mode-tabs">
            <button
              type="button"
              className={`modal-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); setMessage(''); }}
            >
              Create Account
            </button>
          </div>
        )}

        {mode === 'login' && (
          <>
            <p className="modal-subtitle">Welcome back — sign in to your AAAN Cart account</p>
            <form className="modal-form" onSubmit={handleSubmit}>
              {error && <div className="modal-error">{error}</div>}
              {message && <div className="modal-success">{message}</div>}

              <div className="form-group">
                <label htmlFor="modal-email">Email</label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="modal-password" style={{ margin: 0 }}>Password</label>
                  <span className="modal-forgot-link" onClick={() => { setMode('forgot'); setForgotStep(1); setError(''); setMessage(''); }}>
                    Forgot Password?
                  </span>
                </div>
                <input
                  id="modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn btn-sky modal-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">or</div>
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" />

            <p className="modal-footer">
              Don't have an account? <span onClick={() => { setMode('register'); setError(''); setMessage(''); }}>Create one</span>
            </p>
          </>
        )}

        {mode === 'register' && (
          <>
            <p className="modal-subtitle">Create your AAAN Cart account</p>
            <form className="modal-form" onSubmit={handleSubmit}>
              {error && <div className="modal-error">{error}</div>}
              {message && <div className="modal-success">{message}</div>}

              <div className="form-group">
                <label htmlFor="modal-name">Full Name</label>
                <input
                  id="modal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-email">Email</label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-password">Password</label>
                <input
                  id="modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>

              <button type="submit" className="btn btn-sky modal-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-divider">or</div>
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signup_with" />

            <p className="modal-footer">
              Already have an account? <span onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign in</span>
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <p className="modal-subtitle">Reset your password</p>
            {error && <div className="modal-error">{error}</div>}
            {message && <div className="modal-success">{message}</div>}

            {forgotStep === 1 ? (
              <form className="modal-form" onSubmit={handleForgotSendOtp}>
                <div className="form-group">
                  <label htmlFor="forgot-email">Enter your account email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-sky modal-submit" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form className="modal-form" onSubmit={handleForgotVerify}>
                <div className="form-group">
                  <label htmlFor="forgot-code">6-digit OTP Code</label>
                  <input
                    id="forgot-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="forgot-new-pass">New Password</label>
                  <input
                    id="forgot-new-pass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="forgot-confirm-pass">Confirm Password</label>
                  <input
                    id="forgot-confirm-pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-sky modal-submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            <p className="modal-footer">
              <span onClick={() => { setMode('login'); setForgotStep(1); setError(''); setMessage(''); }}>
                Back to Sign In
              </span>
            </p>
          </>
        )}

        {mode === 'setup-password' && (
          <>
            <p className="modal-subtitle">Set a password for your account</p>
            {error && <div className="modal-error">{error}</div>}
            {message && <div className="modal-success">{message}</div>}

            <form className="modal-form" onSubmit={handleSetupPassword}>
              <div className="form-group">
                <label htmlFor="setup-new-pass">New Password</label>
                <input
                  id="setup-new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="setup-confirm-pass">Confirm Password</label>
                <input
                  id="setup-confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn btn-sky modal-submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
