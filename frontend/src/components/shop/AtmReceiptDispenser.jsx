import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Check, Download, Send, CreditCard } from 'lucide-react';
import { formatPrice } from '../../api';
import './AtmReceiptDispenser.css';

export default function AtmReceiptDispenser({ order, onBack, onDownload }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [reminded, setReminded] = useState(false);

  const orderNum = order?.orderNumber || order?._id || 'ORD-98412';
  const totalAmount = order?.total || 2499;
  const items = Array.isArray(order?.items) && order.items.length > 0
    ? order.items
    : [
        { name: '3D Botanical Wall Stickers', price: 1299, quantity: 1 },
        { name: 'Acrylic Wall Niche Decal', price: 1200, quantity: 1 }
      ];

  const handlePrintDownload = () => {
    setDownloading(true);
    if (onDownload) {
      onDownload();
    } else {
      setTimeout(() => {
        window.print();
        setDownloading(false);
      }, 300);
    }
  };

  const handleSendNotification = () => {
    setReminded(true);
    setTimeout(() => setReminded(false), 3000);
  };

  return (
    <div className="atm-dispenser-screen-wrapper">
      {/* Top iOS App Bar */}
      <div className="atm-screen-header">
        <button
          className="atm-nav-icon-btn"
          onClick={() => (onBack ? onBack() : navigate('/account'))}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="atm-header-title">Payment Status</h1>

        <button
          className="atm-nav-icon-btn"
          onClick={handlePrintDownload}
          aria-label="Share Invoice"
        >
          <Share2 size={19} />
        </button>
      </div>

      {/* Main ATM / Thermal Printer Slot Container */}
      <div className="atm-printer-machine-container">
        
        {/* Dark Slot Cutout / Machine Slit */}
        <div className="atm-slot-bezel">
          <div className="atm-slot-inner-slit" />
        </div>

        {/* Animated Receipt Paper Rolling Out of the Slot */}
        <div className="atm-receipt-paper-slip">
          
          {/* Top Paper Perforation & Monospace Header */}
          <div className="receipt-zigzag-top" />
          
          <div className="receipt-invoice-head">
            <div className="receipt-mono-title">
              Store Invoice — Order #{orderNum.slice(-6).toUpperCase()}
            </div>
            <div className="receipt-dashed-divider" />
            
            <div className="receipt-total-row">
              <span className="receipt-total-label">Total Amount</span>
              <span className="receipt-total-val">{formatPrice(totalAmount)}</span>
            </div>

            <div className="receipt-subtotal-row">
              <span>Status</span>
              <span className="badge-paid-text">PAID &amp; CONFIRMED</span>
            </div>
          </div>

          {/* Itemized Paid Breakdown Rows */}
          <div className="receipt-paid-breakdown-list">
            <div className="receipt-payer-row">
              <div className="payer-info">
                <div className="payer-avatar-circle user-avatar">
                  <span>👤</span>
                </div>
                <div className="payer-text">
                  <strong>{order?.shippingAddress?.fullName || 'You'}</strong>
                  <span>Billed Customer</span>
                </div>
              </div>
              <div className="payer-paid-badge">
                <Check size={13} className="check-icon" /> Paid
              </div>
            </div>

            {items.map((it, idx) => (
              <div key={idx} className="receipt-payer-row">
                <div className="payer-info">
                  <div className="payer-avatar-circle item-avatar">
                    <span>🖼️</span>
                  </div>
                  <div className="payer-text">
                    <strong>{it.name || it.productName || '3D Wall Decal'}</strong>
                    <span>Qty: {it.quantity || 1} · {formatPrice(it.price || 999)}</span>
                  </div>
                </div>
                <div className="payer-paid-badge">
                  <Check size={13} className="check-icon" /> Paid
                </div>
              </div>
            ))}
          </div>

          {/* Payment Status Progress Tracker */}
          <div className="receipt-payment-status-block">
            <div className="status-label-row">
              <span>Fulfillment Status</span>
              <strong className="status-highlight">VERIFIED</strong>
            </div>

            <div className="receipt-progress-stepper">
              <div className="step-point completed">
                <Check size={11} />
              </div>
              <div className="step-line completed" />

              <div className="step-point completed">
                <Check size={11} />
              </div>
              <div className="step-line completed" />

              <div className="step-point active">
                <span className="dot-inner" />
              </div>
              <div className="step-line pending" />

              <div className="step-point pending">
                <span className="dot-inner" />
              </div>
            </div>
            
            <div className="step-labels-row">
              <span>Paid</span>
              <span>Confirmed</span>
              <span>Packed</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Bottom Actions inside Receipt */}
          <div className="receipt-slip-actions">
            <button
              className="btn-receipt-dark"
              onClick={handleSendNotification}
            >
              <Send size={14} />
              <span>{reminded ? 'Sent to Email! ✅' : 'Send Receipt'}</span>
            </button>

            <button
              className="btn-receipt-white"
              onClick={handlePrintDownload}
              disabled={downloading}
            >
              <Download size={14} />
              <span>Download Invoice</span>
            </button>
          </div>

          <div className="receipt-zigzag-bottom" />
        </div>

      </div>

      {/* Bottom Payment Method Details & Action */}
      <div className="atm-bottom-payment-bar">
        <div className="payment-method-row">
          <span className="pay-label">Payment Method</span>
          <div className="pay-val-chip">
            <CreditCard size={15} color="#0066FF" />
            <strong>Razorpay / UPI Verified</strong>
            <span className="card-blue-badge" />
          </div>
        </div>

        <button
          className="btn-atm-primary-done"
          onClick={() => navigate('/account')}
        >
          Track in Dashboard
        </button>
      </div>
    </div>
  );
}
