import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { checkout, verifyPayment, formatPrice, getProductPrice } from '../../api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { toastError } from '../../utils/toast.js';
import './Checkout.css';
import '../auth/Auth.css';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zipCode || '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        zip: prev.zip || user.zipCode || '',
      }));
    }
  }, [user]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="success-page">
          <div className="success-card">
            <h1>Cart is empty</h1>
            <Link to="/" className="btn btn-sky">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (result) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      const msg = 'Razorpay payment SDK failed to load. Please check your connection and try again.';
      setError(msg);
      toastError('Payment failed', msg);
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: result.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TUT0EPQqGMykqp',
      amount: result.amount,
      currency: result.currency || 'INR',
      name: 'AAAN Cart',
      description: `3D Wall Art Order #${result.orderId}`,
      image: '/favicon.svg',
      order_id: result.razorpayOrderId,
      prefill: { 
        name: form.fullName, 
        email: form.email, 
        contact: form.phone 
      },
      theme: {
        color: '#10B981',
      },
      handler: async (response) => {
        try {
          await verifyPayment(result.orderId, {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          clearCart();
          navigate(`/checkout/success?orderId=${result.orderId}`);
        } catch (err) {
          const msg = err.message || 'Payment verification failed.';
          setError(msg);
          toastError('Verification failed', msg);
          setLoading(false);
        }
      },
      modal: { 
        ondismiss: () => setLoading(false),
        escape: false,
        backdropclose: false
      },
    });

    rzp.on('payment.failed', (resp) => {
      const msg = resp?.error?.description || 'Payment failed.';
      setError(msg);
      toastError('Payment failed', msg);
      setLoading(false);
    });

    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = items.map((i) => ({
        productId: i._id || i.id,
        name: i.name,
        image: i.image || i.imageUrl,
        price: getProductPrice(i),
        quantity: i.quantity,
      }));
      const result = await checkout(payload, form);
      openRazorpay(result);
    } catch (err) {
      if (err.status === 401) {
        toastError('Session Expired', 'Please log in to complete your purchase.');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      setError(err.message);
      toastError('Checkout failed', err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="container">
          <Link to="/cart" className="back-link">
            <ArrowLeft size={18} /> Back to Cart
          </Link>
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-layout">
            <form className="checkout-form-card" onSubmit={handleSubmit}>
              <h3>Shipping Information</h3>
              {error && <div className="auth-error">{error}</div>}
              <div className="checkout-grid">
                <div className="form-group full">
                  <label>Full Name</label>
                  <input value={form.fullName} onChange={update('fullName')} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={update('email')} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={update('phone')} />
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <input value={form.address} onChange={update('address')} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input value={form.city} onChange={update('city')} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input value={form.state} onChange={update('state')} />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input value={form.zip} onChange={update('zip')} required />
                </div>
              </div>
              <button type="submit" className="checkout-pay-btn" disabled={loading}>
                <ShieldCheck size={20} />
                <span>{loading ? 'Processing...' : `Pay ${formatPrice(cartTotal)} via Razorpay`}</span>
              </button>
            </form>

            <div className="checkout-summary">
              <h3>Order Summary</h3>
              {items.map((item) => (
                <div key={item._id} className="checkout-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-item-info">
                    <h4>{item.name}</h4>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span>{formatPrice(getProductPrice(item) * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-divider" style={{ margin: '16px 0', borderTop: '2px solid var(--border)' }} />
              <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
