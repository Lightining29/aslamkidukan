import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchAdminProducts, createOfflineSale, formatPrice } from '../../api';
import '../../styles/Panel.css';

export default function AdminOfflineSale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  // Selected product state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState('');
  
  // Customer & Payment state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Transaction outcome
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    fetchAdminProducts()
      .then((data) => {
        // Only show products in stock or that exist
        setProducts(data || []);
      })
      .finally(() => setLoading(false));
  };

  const handleProductChange = (productId) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p._id === productId);
    if (prod) {
      setSelectedPrice(prod.finalPrice ?? prod.price);
      setSelectedQty(1);
    } else {
      setSelectedPrice('');
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const prod = products.find((p) => p._id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(selectedQty, 10);
    const price = parseFloat(selectedPrice);

    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }

    // Check if product stock is sufficient
    const existingCartItem = cart.find((item) => item.productId === selectedProductId);
    const totalQtyNeeded = qty + (existingCartItem ? existingCartItem.quantity : 0);

    if (prod.stockQuantity < totalQtyNeeded) {
      setError(`Insufficient stock. Only ${prod.stockQuantity} available.`);
      return;
    }

    setError('');

    if (existingCartItem) {
      setCart(
        cart.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: totalQtyNeeded, price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: prod._id,
          name: prod.name,
          price,
          quantity: qty,
          image: prod.image,
        },
      ]);
    }

    // Reset selector
    setSelectedProductId('');
    setSelectedQty(1);
    setSelectedPrice('');
  };

  const handleRemoveItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Please add at least one product to the sale');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        items: cart,
        paymentMethod,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
      };

      const result = await createOfflineSale(payload);
      setSuccessOrder(result);
      
      // Clear form on success
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setPaymentMethod('cash');
      loadProducts(); // Reload products to get updated stock
    } catch (err) {
      setError(err.message || 'Failed to record offline sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  return (
    <>
      <div className="offline-sale-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1>Direct / Offline Sale</h1>
            <p className="panel-subtitle">Record direct in-store sales, manage stock, and print invoices</p>
          </div>
          {successOrder && (
            <button className="btn btn-secondary" onClick={() => setSuccessOrder(null)}>
              <ArrowLeft size={16} /> New Sale
            </button>
          )}
        </div>

        {error && <div className="form-error-banner" style={{ marginBottom: 20 }}>{error}</div>}

        {successOrder ? (
          /* SUCCESS BANNER & INVOICE SCREEN */
          <div className="sale-success-container">
            <div className="panel-card success-banner" style={{ display: 'flex', alignItems: 'center', gap: 16, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', padding: 20, marginBottom: 30 }}>
              <CheckCircle size={40} color="#10B981" />
              <div>
                <h3 style={{ color: '#065F46', margin: 0 }}>Sale Recorded Successfully!</h3>
                <p style={{ color: '#047857', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Invoice number: <strong>{successOrder.orderNumber}</strong>. Stock levels updated.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={18} /> Print Invoice
              </button>
              <button className="btn btn-secondary" onClick={() => setSuccessOrder(null)}>
                <Plus size={18} /> Record Another Sale
              </button>
            </div>

            {/* PRINTABLE INVOICE CARD */}
            <div className="invoice-preview-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="printable-invoice" style={{ width: '100%', maxWidth: '650px', background: '#FFFFFF', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                {/* Invoice Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: 24, marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-dark)', margin: 0 }}>AAAN CART</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
                      3D Wall Art &amp; Botanical Decals<br />
                      75 Raja Muthai Road, Periyamet,<br />
                      Chennai - 600003<br />
                      Phone: +91 80 7378 6650
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--rose-gold)', textTransform: 'uppercase', letterSpacing: 1 }}>Retail Invoice</span>
                    <h4 style={{ margin: '8px 0 4px', fontSize: '1.05rem', color: 'var(--text-dark)' }}>{successOrder.orderNumber}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Date: {new Date(successOrder.createdAt).toLocaleDateString()}<br />
                      Time: {new Date(successOrder.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Customer Details */}
                <div style={{ backgroundColor: 'var(--cream)', borderRadius: '12px', padding: '16px', marginBottom: 24, fontSize: '0.85rem' }}>
                  <h4 style={{ margin: '0 0 8px', color: 'var(--text-dark)' }}>Billed To:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                    <div>Name: <strong>{successOrder.shippingAddress?.fullName || 'Walk-in Customer'}</strong></div>
                    {successOrder.shippingAddress?.phone && <div>Phone: {successOrder.shippingAddress.phone}</div>}
                    {successOrder.shippingAddress?.email && <div>Email: {successOrder.shippingAddress.email}</div>}
                    <div>Payment Method: <strong style={{ textTransform: 'uppercase' }}>{successOrder.paymentMethod}</strong></div>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--text-dark)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0', fontWeight: 600, color: 'var(--text-dark)' }}>Item & Description</th>
                      <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-dark)' }}>Rate</th>
                      <th style={{ padding: '8px 0', textAlign: 'center', fontWeight: 600, color: 'var(--text-dark)' }}>Qty</th>
                      <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-dark)' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successOrder.items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 0', color: 'var(--text-dark)' }}>{item.name}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-dark)' }}>{formatPrice(item.price)}</td>
                        <td style={{ padding: '12px 0', textAlign: 'center', color: 'var(--text-dark)' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 500, color: 'var(--text-dark)' }}>{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid var(--text-dark)', paddingTop: 16 }}>
                  <div style={{ width: '220px', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>Subtotal:</span>
                      <span>{formatPrice(successOrder.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-dark)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                      <span>Total:</span>
                      <span>{formatPrice(successOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Footer */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 40, paddingTop: 16, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>Thank you for shopping with us!</p>
                  <p style={{ margin: '4px 0 0' }}>This is a computer-generated invoice and does not require a physical signature.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TRANSACTION INPUT FORM */
          <div className="offline-sale-container" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
            
            {/* Left side: Selector and Cart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Product Selector */}
              <div className="panel-card" style={{ padding: 24, backgroundColor: '#FFF', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem' }}>Add Product to Sale</h3>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
                    <RefreshCw className="animate-spin" size={16} /> Loading products...
                  </div>
                ) : (
                  <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr auto', gap: 16, alignItems: 'end' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Select Product</label>
                      <select
                        className="form-control"
                        value={selectedProductId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', outline: 'none' }}
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.stockQuantity} in stock) - {formatPrice(p.finalPrice ?? p.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct ? selectedProduct.stockQuantity : undefined}
                        className="form-control"
                        value={selectedQty}
                        onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={!selectedProductId}
                        style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', outline: 'none' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Unit Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={selectedPrice}
                        onChange={(e) => setSelectedPrice(e.target.value)}
                        disabled={!selectedProductId}
                        style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', outline: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!selectedProductId}
                      style={{ height: '42px', borderRadius: '10px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={18} /> Add
                    </button>
                  </form>
                )}
              </div>

              {/* Cart List */}
              <div className="panel-card" style={{ padding: 24, backgroundColor: '#FFF', borderRadius: '16px', boxShadow: 'var(--shadow)', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart size={18} /> Sale items ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button className="btn btn-sm btn-secondary" onClick={() => setCart([])} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>Direct sale cart is empty</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>Choose products from the form above to build the invoice.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cart.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--cream)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ flexGrow: 1 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.92rem', display: 'block' }}>
                              {item.name}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {formatPrice(item.price)} × {item.quantity}
                            </span>
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            style={{ color: '#EF4444', padding: 6, borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div style={{ borderTop: '2px dashed var(--border)', marginTop: 24, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Subtotal Amount:</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rose-gold-dark)' }}>
                        {formatPrice(getSubtotal())}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right side: Customer and Payment details */}
            <div className="panel-card" style={{ padding: 24, backgroundColor: '#FFF', borderRadius: '16px', boxShadow: 'var(--shadow)', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.15rem' }}>Checkout & Payment</h3>
              <form onSubmit={handleSubmit}>
                
                {/* Customer Name */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', outline: 'none' }}
                  />
                </div>

                {/* Customer Phone */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Customer Phone (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 99999 99999"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', outline: 'none' }}
                  />
                </div>

                {/* Customer Email */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Customer Email (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', outline: 'none' }}
                  />
                </div>

                {/* Payment Method */}
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Payment Method</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: paymentMethod === 'cash' ? '#EFF6FF' : '#FFF', borderColor: paymentMethod === 'cash' ? '#3B82F6' : 'var(--border)' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cash</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: paymentMethod === 'UPI' ? '#EFF6FF' : '#FFF', borderColor: paymentMethod === 'UPI' ? '#3B82F6' : 'var(--border)' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>UPI</span>
                    </label>
                  </div>
                </div>

                {/* Summary Table */}
                <div style={{ backgroundColor: 'var(--cream)', padding: 16, borderRadius: '12px', marginBottom: 24, fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Items count:</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--border)', paddingTop: 8, color: 'var(--text-dark)' }}>
                    <span>Total Due:</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={cart.length === 0 || submitting}
                  style={{ width: '100%', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.95rem' }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} /> Processing...
                    </>
                  ) : (
                    <>Record Offline Sale & Generate Invoice</>
                  )}
                </button>

              </form>
            </div>

          </div>
        )}
      </div>

      {/* CSS PRINT STYLING */}
      <style>{`
        @media print {
          /* Hide all screen components */
          body * {
            visibility: hidden;
            background: none !important;
          }
          
          /* Show only the printable invoice card */
          .printable-invoice,
          .printable-invoice * {
            visibility: visible;
          }
          
          .printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Hide print trigger elements during print */
          button, 
          .btn,
          .panel-sidebar,
          .admin-mobile-bar,
          .admin-overlay,
          .offline-sale-page > div:first-of-type,
          .sale-success-container > div:first-of-type,
          .sale-success-container > div:second-of-type {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
