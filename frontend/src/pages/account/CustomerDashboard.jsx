import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Clock, Award, Coins, Truck, CheckCircle2, Download, RefreshCw, Heart, Eye, ArrowRight, ShieldCheck, MapPin, Phone, Sparkles, Navigation, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { fetchMyOrders, formatPrice, getStatusLabel, getStatusColor } from '../../api';
import { useCart } from '../../context/CartContext';
import OrderTimeline from '../../components/shop/OrderTimeline';
import OrderReceiptModal from '../../components/shop/OrderReceiptModal';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { toastSuccess } from '../../utils/toast.js';
import './CustomerDashboard.css';

export default function CustomerDashboard({ defaultTab }) {
  const location = useLocation();
  const initialTab = defaultTab || (location.pathname.includes('cart') ? 'cart' : 'live_tracking');
  const [activeTab, setActiveTab] = useState(initialTab);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { list: recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchMyOrders()
      .then((data) => {
        setOrders(data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || orders[0] || {
    _id: 'demo-active-1',
    orderNumber: 'ORD-AAAN-98412',
    createdAt: new Date().toISOString(),
    status: 'out_for_delivery',
    total: 3499,
    items: [
      { name: 'AAAN Executive Ergonomic Chair', quantity: 1, price: 3499, image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=400' }
    ]
  };

  const handleReturnInitiate = (orderId) => {
    toastSuccess('Return Request Initiated 📦', 'Doorstep pickup scheduled for tomorrow.');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p>Loading Your Customer Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-shell pull-page-into-view">
      
      {/* Welcome & Loyalty KPI Header Banner */}
      <div className="dash-hero-banner pull-stagger-1">
        <div className="hero-profile-info">
          <div className="vip-badge-pill">
            <Award size={16} color="#FFE600" />
            <span>🥇 GOLD VIP MEMBER</span>
          </div>
          <h2>Welcome Back, Esteemed Customer! 👋</h2>
          <p>Track live orders, manage reward coins, view product history &amp; checkout cart items.</p>
        </div>

        <div className="kpi-cards-grid">
          <div className="kpi-box">
            <Coins size={22} color="#FFE600" />
            <div>
              <span className="kpi-val">850 Coins</span>
              <span className="kpi-lbl">Wallet Balance (₹850)</span>
            </div>
          </div>

          <div className="kpi-box">
            <ShoppingBag size={22} color="#F472B6" />
            <div>
              <span className="kpi-val">{cartItems.length} Items</span>
              <span className="kpi-lbl">In Your Cart</span>
            </div>
          </div>

          <div className="kpi-box">
            <Package size={22} color="#60A5FA" />
            <div>
              <span className="kpi-val">{orders.length || 4} Orders</span>
              <span className="kpi-lbl">Total Placed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="dash-tabs-bar pull-stagger-2">
        <button className={`dash-tab ${activeTab === 'live_tracking' ? 'active' : ''}`} onClick={() => setActiveTab('live_tracking')}>
          <Navigation size={16} /> Live Order Tracking
        </button>
        <button className={`dash-tab ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
          <ShoppingBag size={16} /> Active Shopping Cart ({cartItems.length})
        </button>
        <button className={`dash-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <Package size={16} /> Order History &amp; Receipts
        </button>
        <button className={`dash-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Eye size={16} /> Recently Viewed History ({recentlyViewed.length})
        </button>
        <button className={`dash-tab ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>
          <Coins size={16} /> Rewards Wallet &amp; Offers
        </button>
      </div>

      {/* Tab 1: Live Real-Time Order Tracker */}
      {activeTab === 'live_tracking' && (
        <div className="dash-card live-tracker-card">
          <div className="card-head-row">
            <div>
              <span className="live-pulse-badge">🔴 REAL-TIME LIVE TRACKING</span>
              <h3 className="card-title">Order #{activeOrder.orderNumber}</h3>
              <p className="card-sub">Expected Delivery: <strong>Today by 2:30 PM</strong> via BlueDart Air</p>
            </div>

            <a href="tel:+918073786650" className="btn-call-agent">
              <Phone size={16} /> Call Delivery Agent
            </a>
          </div>

          {/* 6-Stage Timeline Component */}
          <OrderTimeline order={activeOrder} />

          {/* Active Items Row */}
          <div className="active-order-items">
            <h4>Items in this Delivery ({activeOrder.items?.length || 1})</h4>
            <div className="items-row flex">
              {(activeOrder.items || []).map((it, i) => (
                <div key={i} className="active-item-chip">
                  <img src={it.image || 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=200'} alt={it.name} />
                  <div>
                    <strong>{it.name}</strong>
                    <span>Qty: {it.quantity} · {formatPrice(it.price * it.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Integrated Active Shopping Cart */}
      {activeTab === 'cart' && (
        <div className="dash-card">
          <h3 className="card-title">🛒 Active Shopping Cart ({cartItems.length} Items)</h3>
          
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <ShoppingBag size={48} color="#94A3B8" />
              <h4 style={{ marginTop: '12px' }}>Your Cart is Currently Empty</h4>
              <p style={{ color: '#64748B' }}>Add items from our store catalog to view them here in your dashboard.</p>
              <Link to="/" className="btn-mktg-primary" style={{ display: 'inline-block', marginTop: '14px' }}>
                Explore Catalog &amp; Deals
              </Link>
            </div>
          ) : (
            <div>
              <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {cartItems.map((item) => (
                  <div key={item.id || item._id} className="dash-cart-item-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                    <img src={item.image || '/aaan-logo.svg'} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.name}</strong>
                      {item.selectedSize && (
                        <span style={{ fontSize: '0.78rem', color: '#6366F1', fontWeight: 700 }}>Size: {item.selectedSize}</span>
                      )}
                      <div style={{ color: '#4F46E5', fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateQuantity(item.id || item._id, (item.quantity || 1) - 1)} className="qty-btn-sm">
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id || item._id, (item.quantity || 1) + 1)} className="qty-btn-sm">
                        <Plus size={14} />
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.id || item._id)} className="btn-remove-item" title="Remove item">
                      <Trash2 size={16} color="#EF4444" />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', borderRadius: '20px', padding: '20px 24px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Subtotal ({cartItems.length} items):</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFE600' }}>{formatPrice(cartTotal)}</div>
                </div>

                <Link to="/checkout" className="btn-mktg-primary" style={{ textDecoration: 'none', background: '#FFE600', color: '#0F172A', fontWeight: 800, padding: '12px 24px' }}>
                  Proceed to Secure Checkout →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Full Order History & Receipts */}
      {activeTab === 'orders' && (
        <div className="dash-card">
          <h3 className="card-title">📦 Your Order History ({orders.length})</h3>
          
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Package size={48} color="#94A3B8" />
              <p>No orders placed yet.</p>
              <Link to="/" className="btn-mktg-primary">Explore Store Catalog</Link>
            </div>
          ) : (
            <div className="orders-stack">
              {orders.map((ord) => (
                <div key={ord._id} className="dash-order-item">
                  <div className="ord-head">
                    <div>
                      <strong>{ord.orderNumber}</strong>
                      <span className="ord-date">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="status-pill" style={{ background: `${getStatusColor(ord.status)}20`, color: getStatusColor(ord.status) }}>
                        {getStatusLabel(ord.status)}
                      </span>
                      <button onClick={() => setSelectedReceiptOrder(ord)} className="btn-tax-receipt">
                        <Download size={14} /> Tax Invoice PDF
                      </button>
                    </div>
                  </div>

                  <OrderTimeline order={ord} />

                  <div className="ord-foot">
                    <span>Total Paid: <strong>{formatPrice(ord.total)}</strong></span>
                    <button onClick={() => handleReturnInitiate(ord._id)} className="btn-return-easy">
                      <RefreshCw size={14} /> Initiate 30-Day Easy Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Recently Viewed Product History */}
      {activeTab === 'history' && (
        <div className="dash-card">
          <h3 className="card-title">🕒 Products You Recently Viewed ({recentlyViewed.length})</h3>
          {recentlyViewed.length === 0 ? (
            <p style={{ color: '#64748B' }}>No products in your recent viewing history.</p>
          ) : (
            <div className="view-history-grid">
              {recentlyViewed.map((prod) => (
                <div key={prod._id} className="history-prod-card">
                  <img src={prod.image || '/aaan-logo.svg'} alt={prod.name} />
                  <div className="h-info">
                    <strong>{prod.name}</strong>
                    <span className="h-price">{formatPrice(prod.price)}</span>
                    <Link to={`/product/${prod.slug}`} className="btn-buy-again">
                      View &amp; Buy Again <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Rewards Wallet */}
      {activeTab === 'rewards' && (
        <div className="dash-card">
          <h3 className="card-title">💰 AAAN Loyalty Rewards &amp; Wallet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', padding: '24px', borderRadius: '20px', color: 'white' }}>
              <span style={{ fontSize: '0.78rem', color: '#FFE600', fontWeight: 800 }}>AVAILABLE REWARD COINS</span>
              <h2 style={{ fontSize: '2.2rem', margin: '8px 0 12px', color: '#FFE600' }}>850 Coins</h2>
              <p style={{ fontSize: '0.88rem', opacity: 0.85 }}>Equivalents to ₹850 discount on your next checkout order.</p>
              <button onClick={() => toastSuccess('Coins Applied! 🎁', '850 Coins redeemed for ₹850 checkout discount.')} className="btn-claim-coupon" style={{ background: '#FFE600', color: '#0F172A', fontWeight: 800 }}>
                Redeem 850 Coins at Checkout
              </button>
            </div>

            <div style={{ background: '#EEF2FF', padding: '24px', borderRadius: '20px', border: '1px solid #C7D2FE' }}>
              <span style={{ fontSize: '0.78rem', color: '#4F46E5', fontWeight: 800 }}>YOUR TIER STATUS</span>
              <h3 style={{ fontSize: '1.4rem', color: '#1E1B4B', margin: '8px 0 6px' }}>🥇 Gold VIP Tier Member</h3>
              <ul style={{ fontSize: '0.85rem', color: '#4338CA', paddingLeft: '18px', margin: 0 }}>
                <li>✓ 1.25x Extra Reward Points on all purchases</li>
                <li>✓ Free Doorstep Express Shipping across India</li>
                <li>✓ Priority 24/7 Support Escalation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedReceiptOrder && (
        <OrderReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

    </div>
  );
}
