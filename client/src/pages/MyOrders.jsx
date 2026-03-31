import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../utils/api';

const STATUS_COLORS = {
  pending: { bg: 'var(--accent-subtle)', color: 'var(--accent)' },
  processing: { bg: '#fef9c3', color: '#854d0e' },
  shipped: { bg: '#eff6ff', color: '#1d4ed8' },
  delivered: { bg: '#f0fdf4', color: '#166534' },
  cancelled: { bg: '#fef2f2', color: '#991b1b' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => { setOrders(data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-3xl mb-8" style={{ color: 'var(--text-primary)' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 card p-12">
          <Package size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-primary)' }} />
          <h2 className="text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No orders yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Looks like you haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <Link to={`/orders/${order._id}`} key={order._id} className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all block">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <Package size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="badge text-xs" style={{ backgroundColor: sc.bg, color: sc.color }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>₹{order.totalPrice.toLocaleString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
