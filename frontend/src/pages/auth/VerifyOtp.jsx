import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Droplets, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toastSuccess, toastError, toastInfo } from '../../utils/toast.js';
import './Auth.css';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtp(email, code);
      toastSuccess('Email verified!', 'Welcome to AAAN Cart.');
      navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed');
      toastError('Verification failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      await resendOtp(email);
      toastInfo('Code sent!', 'Check your email for the new verification code.');
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
      toastError('Resend failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Droplets size={28} /> Glowora
        </div>
        <p className="auth-subtitle">Verify your email address</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={!!location.state?.email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <div style={{ position: 'relative' }}>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                style={{ paddingLeft: '40px', letterSpacing: '2px', fontWeight: 'bold' }}
                required
              />
              <KeyRound 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-sky auth-submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px', fontSize: '0.85rem' }}>
          {countdown > 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              Resend code in <strong>{countdown}s</strong>
            </p>
          ) : (
            <p>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                onClick={handleResend}
                disabled={loading || !email}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--sky-blue-deep)', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Resend Code
              </button>
            </p>
          )}
          <p style={{ marginTop: '12px' }}>
            <Link to="/login" style={{ fontSize: '0.85rem' }}>Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
