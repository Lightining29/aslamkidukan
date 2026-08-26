import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchOrder } from '../../api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AtmReceiptDispenser from '../../components/shop/AtmReceiptDispenser';
import { toastSuccess, toastError } from '../../utils/toast.js';
import './Checkout.css';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    toastSuccess('Payment successful! 🎉', 'Your official order receipt is ready.');
    if (orderId) {
      fetchOrder(orderId)
        .then(setOrder)
        .catch(() => toastError('Could not load order', 'Your payment went through — check Order History.'));
    }
  }, [orderId]);

  const fallbackOrder = {
    orderNumber: orderId || `ORD-${Date.now().toString().slice(-6)}`,
    total: 2499,
    createdAt: new Date().toISOString(),
    status: 'Paid & Confirmed',
    shippingAddress: {
      fullName: 'You',
      city: 'India'
    },
    items: [
      { name: '3D Botanical Wall Stickers Set', price: 1299, quantity: 1 },
      { name: 'Acrylic Wall Niche Decor', price: 1200, quantity: 1 }
    ]
  };

  return (
    <>
      <Navbar />
      <div className="checkout-atm-success-page" style={{ minHeight: '100vh', background: '#F8FAFC', padding: '20px 0 60px' }}>
        <AtmReceiptDispenser
          order={order || fallbackOrder}
          onBack={() => navigate('/account')}
          onDownload={() => window.print()}
        />
      </div>
      <Footer />
    </>
  );
}
