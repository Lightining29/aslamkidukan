import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, AlertCircle, Package, TrendingUp, Star, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAdminAnalytics, formatPrice, getStatusLabel, getStatusColor } from '../../api';
import '../../styles/Panel.css';

const initialAnalytics = {
  totalRevenue: 0,
  totalOrders: 0,
  totalUsers: 0,
  pendingApproval: 0,
  recentOrders: [],
  topProducts: [],
  lowStock: []
};

export default function AdminDashboard() {
  const [data, setData] = useState(initialAnalytics);

  useEffect(() => {
    fetchAdminAnalytics()
      .then((res) => {
        if (res) {
          setData({
            totalRevenue: Number(res.totalRevenue) || 0,
            totalOrders: Number(res.totalOrders) || 0,
            totalUsers: Number(res.totalUsers) || 0,
            pendingApproval: Number(res.pendingApproval) || 0,
            recentOrders: Array.isArray(res.recentOrders) ? res.recentOrders : [],
            topProducts: Array.isArray(res.topProducts) ? res.topProducts : [],
            lowStock: Array.isArray(res.lowStock) ? res.lowStock : []
          });
        }
      })
      .catch(() => {
        setData(initialAnalytics);
      });
  }, []);

  if (!data) return <div className="loading-spinner" style={{ margin: '60px auto' }} />;

  return (
    <>
      {/* Meesho Banner Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #9f2089 0%, #6C5CE7 100%)',
          borderRadius: '20px',
          padding: '24px 32px',
          color: 'white',
          marginBottom: '28px',
          boxShadow: '0 8px 24px rgba(159, 32, 137, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
            Meesho Seller Hub Overview
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 6px' }}>
            Welcome back, Supplier! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>
            Your store is live and accepting orders. Express fulfillment enabled.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/admin/products/new"
            style={{
              background: 'white',
              color: '#9f2089',
              fontWeight: 800,
              padding: '10px 20px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            + Add New Catalog
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: '#FFF0F7', border: '1px solid #FCDDEC' }}>
          <div className="stat-label" style={{ color: '#9f2089', fontWeight: 700 }}>Total Revenue</div>
          <div className="stat-value" style={{ color: '#9f2089' }}>{formatPrice(data.totalRevenue)}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Lifetime sales processed</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={16} color="#6C5CE7" /> Total Orders
          </div>
          <div className="stat-value">{data.totalOrders}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>↑ Active order flow</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="#0284C7" /> Total Customers
          </div>
          <div className="stat-value">{data.totalUsers}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Registered buyers</div>
        </div>

        <div className="stat-card" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div className="stat-label" style={{ color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> Pending Approval
          </div>
          <div className="stat-value" style={{ color: '#D97706' }}>{data.pendingApproval}</div>
          <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '4px' }}>Requires supplier dispatch</div>
        </div>
      </div>

      {/* Dashboard Tables Grid */}
      <div className="dashboard-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Recent Orders</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: '#9f2089', fontWeight: 700, textDecoration: 'none' }}>
              View All Orders →
            </Link>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td data-label="Order ID" style={{ fontWeight: 700, color: '#1E1B4B' }}>{o.orderNumber}</td>
                    <td data-label="Customer">{o.user?.name || 'Customer'}</td>
                    <td data-label="Total" style={{ fontWeight: 700 }}>{formatPrice(o.total)}</td>
                    <td data-label="Status">
                      <span className="status-badge" style={{ background: `${getStatusColor(o.status)}18`, color: getStatusColor(o.status) }}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Top Selling Catalogs</h3>
            <Link to="/admin/products" style={{ fontSize: '0.85rem', color: '#9f2089', fontWeight: 700, textDecoration: 'none' }}>
              Manage Catalogs →
            </Link>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Catalog Name</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p._id}>
                    <td data-label="Product" style={{ fontWeight: 600 }}>{p.name}</td>
                    <td data-label="Sold" style={{ fontWeight: 700, color: '#10B981' }}>{p.sold}</td>
                    <td data-label="Revenue" style={{ fontWeight: 700 }}>{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
                {data.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>No sales data available yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.lowStock.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.05rem', fontWeight: 700, color: '#EF4444' }}>
                ⚠️ Low Stock Catalog Warning
              </h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>Catalog Product</th><th>Stock Left</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {data.lowStock.map((p) => (
                      <tr key={p._id}>
                        <td data-label="Product">{p.name}</td>
                        <td data-label="Stock" style={{ color: '#EF4444', fontWeight: 700 }}>{p.stockQuantity} pcs</td>
                        <td data-label="Action">
                          <Link to="/admin/stock" style={{ color: '#9f2089', fontWeight: 700, fontSize: '0.8rem' }}>Refill</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
