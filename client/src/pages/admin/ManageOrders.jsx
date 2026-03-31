import { useEffect, useMemo, useState } from 'react';
import { Filter, Eye, Search, Download } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders', { params: { status: status === 'all' ? '' : status } });
      setOrders(data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [status]);

  const filtered = useMemo(() => {
    const base = orders.filter((o) =>
      !query ||
      o._id.toLowerCase().includes(query.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(query.toLowerCase())
    );
    return base.sort((a, b) => {
      if (sortBy === 'total') return b.totalPrice - a.totalPrice;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [orders, query, sortBy]);

  const exportCsv = () => {
    const rows = [
      ['OrderId', 'Customer', 'Total', 'Status', 'CreatedAt'],
      ...filtered.map((o) => [
        o._id,
        o.user?.name || 'Guest',
        o.totalPrice,
        o.status,
        new Date(o.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Orders</p>
          <h1 className="admin-page-title">Order Management</h1>
        </div>
        <div className="admin-page-actions">
          <div className="admin-search">
            <Search size={16} />
            <input
              placeholder="Search order or customer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="admin-filter">
            <Filter size={16} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="admin-filter">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="total">Total: High to Low</option>
            </select>
          </div>
          <button className="admin-ghost-btn" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden admin-table-card">
        {loading ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>â‚¹{order.totalPrice?.toLocaleString()}</td>
                    <td>
                      <span className={`admin-status ${order.status === 'delivered' ? 'success' : 'danger'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button className="admin-icon-btn" title="View">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
