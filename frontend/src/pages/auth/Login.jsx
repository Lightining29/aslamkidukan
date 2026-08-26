import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { toastError, toastSuccess } from '../../utils/toast.js';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(credential);
      toastSuccess('Welcome back!', `Signed in as ${user.name}`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.message || 'Google login failed');
      toastError('Google login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setError(err.message || 'Google Sign-In failed');
    toastError('Google Sign-In failed', err.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toastSuccess('Welcome back!', `Signed in as ${user.name}`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      if (err.data?.requireVerification) {
        navigate('/verify-otp', { state: { email: err.data.email } });
      } else {
        setError(err.message);
        toastError('Sign in failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Droplets size={28} /> AAAN Cart
        </div>
        <p className="auth-subtitle">Welcome back — sign in to your account</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-sky auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" />

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
}
