import { useEffect, useState } from 'react';
import { fetchAdminOrders, approveOrder, shipOrder, formatPrice, getStatusLabel, getStatusColor } from '../../api';
import { Package, Search, Printer, CheckCircle, Truck, Clock, XCircle, ChevronRight, User, Phone, MapPin } from 'lucide-react';
import OrderTimeline from '../../components/shop/OrderTimeline';
import '../../styles/Panel.css';

function getCustomerName(order) {
  return order.shippingAddress?.fullName || order.user?.name || 'Customer';
}

function getCustomerEmail(order) {
  return order.shippingAddress?.email || order.user?.email || '';
}

function getCustomerPhone(order) {
  return order.shippingAddress?.phone || order.user?.phone || '';
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const load = () => {
    fetchAdminOrders()
      .then((res) => {
        if (Array.isArray(res)) setOrders(res);
        else setOrders([]);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    await approveOrder(id);
    load();
  };

  const handleShip = async (id) => {
    await shipOrder(id);
    load();
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '40px auto' }} />;

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'pending' ? order.status === 'pending_payment' :
      activeTab === 'paid' ? order.status === 'paid' :
      activeTab === 'approved' ? order.status === 'approved' :
      activeTab === 'shipped' ? order.status === 'shipped' :
      activeTab === 'cancelled' ? order.status === 'cancelled' : true;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ? true : (
      (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
      (getCustomerName(order).toLowerCase().includes(query)) ||
      (getCustomerEmail(order).toLowerCase().includes(query))
    );

    return matchesTab && matchesSearch;
  });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#1E1B4B' }}>
            Orders &amp; Fulfillments
          </h1>
          <p className="panel-subtitle" style={{ margin: 0 }}>
            Manage Meesho catalog orders, approve payments, and update shipment tracking
          </p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search order ID or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 14px 8px 36px', borderRadius: '50px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Meesho Order Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'paid', label: 'Awaiting Approval', count: orders.filter(o => o.status === 'paid').length },
          { id: 'approved', label: 'Ready to Ship', count: orders.filter(o => o.status === 'approved').length },
          { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
          { id: 'pending', label: 'Pending Payment', count: orders.filter(o => o.status === 'pending_payment').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '50px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--meesho-magenta)' : '#F1F5F9',
              color: activeTab === tab.id ? 'white' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.label}</span>
            <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#E2E8F0', padding: '2px 8px', borderRadius: '50px', fontSize: '0.75rem' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state" style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <Package size={48} color="#9f2089" style={{ opacity: 0.4 }} />
          <h3 style={{ marginTop: '12px', color: '#1E1B4B' }}>No orders found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Try adjusting your search query or tab filter.</p>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const customerName = getCustomerName(order);
          const customerEmail = getCustomerEmail(order);
          const customerPhone = getCustomerPhone(order);

          return (
            <div key={order._id} className="order-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div className="order-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#1E1B4B' }}>{order.orderNumber}</strong>
                    <span className="status-badge" style={{ background: `${getStatusColor(order.status)}18`, color: getStatusColor(order.status), fontWeight: 700 }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="order-customer" style={{ marginTop: '6px', fontSize: '0.85rem' }}>
                    <span><User size={14} style={{ inlineSize: '14px', verticalAlign: 'middle' }} /> {customerName}</span>
                    {customerEmail && <span>{customerEmail}</span>}
                    {customerPhone && <a href={`tel:${customerPhone}`} style={{ color: '#9f2089', fontWeight: 600 }}>📞 {customerPhone}</a>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 0' }}>
                    Order Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B' }}>
                    {formatPrice(order.total)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                    Prepaid Order · Express Delivery
                  </div>
                </div>
              </div>

              <div className="order-items-list" style={{ marginTop: '16px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px' }}>
                {order.items.map((item, i) => (
                  <div key={i} className="order-item-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div className="order-item-image-placeholder" />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1E1B4B' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Qty: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {order.shippingAddress && (
                <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#9f2089" />
                  <span><strong>Ship to:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.zip}</span>
                </div>
              )}

              {/* 6-Stage Delivery Timeline */}
              <OrderTimeline order={order} />

              <div className="panel-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {order.status === 'paid' && (
                  <button className="btn btn-sm btn-approve" onClick={() => handleApprove(order._id)} style={{ background: '#10B981', color: 'white', fontWeight: 700 }}>
                    Approve Supplier Payment
                  </button>
                )}
                {order.status === 'approved' && (
                  <button className="btn btn-sm btn-ship" onClick={() => handleShip(order._id)} style={{ background: 'var(--meesho-magenta)', color: 'white', fontWeight: 700 }}>
                    Mark Shipped &amp; Assign Tracking
                  </button>
                )}
                <button
                  className="btn btn-sm"
                  onClick={() => setSelectedInvoiceOrder(order)}
                  style={{ background: '#F1F5F9', color: '#1E1B4B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={14} /> Print Meesho Invoice
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #9f2089', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#9f2089', fontSize: '1.4rem' }}>Meesho Supplier Invoice</h2>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Tax Invoice / Bill of Supply</div>
              </div>
              <button onClick={() => setSelectedInvoiceOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={22} /></button>
            </div>
            <div style={{ fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6 }}>
              <div><strong>Invoice No:</strong> INV-{selectedInvoiceOrder.orderNumber}</div>
              <div><strong>Date:</strong> {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</div>
              <div><strong>Customer Name:</strong> {getCustomerName(selectedInvoiceOrder)}</div>
              <div><strong>Delivery Address:</strong> {selectedInvoiceOrder.shippingAddress?.address || 'Standard Shipping'}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#FDF2FB', color: '#9f2089', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Item</th>
                  <th style={{ padding: '8px' }}>Qty</th>
                  <th style={{ padding: '8px' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px' }}>{item.name}</td>
                    <td style={{ padding: '8px' }}>{item.quantity}</td>
                    <td style={{ padding: '8px' }}>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px', color: '#9f2089' }}>
              Total Amount: {formatPrice(selectedInvoiceOrder.total)}
            </div>
            <button onClick={() => window.print()} style={{ width: '100%', background: '#9f2089', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Print Tax Receipt
            </button>
          </div>
        </div>
      )}
    </>
  );
}
