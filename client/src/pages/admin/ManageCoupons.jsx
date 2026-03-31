import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import CouponForm from '../../components/admin/CouponForm';

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const filtered = useMemo(() => {
    const base = coupons.filter((c) => !query || c.code.toLowerCase().includes(query.toLowerCase()));
    return base.sort((a, b) => {
      if (sortBy === 'expiry') return new Date(a.expiryDate) - new Date(b.expiryDate);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [coupons, query, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Coupons</p>
          <h1 className="admin-page-title">Discount Codes</h1>
        </div>
        <div className="admin-page-actions">
          <div className="admin-search">
            <Search size={16} />
            <input
              placeholder="Search coupon code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="admin-filter">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="expiry">Nearest Expiry</option>
            </select>
          </div>
          <button className="btn-primary px-4 py-2" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      <div className="admin-panel admin-table-card">
        {loading ? (
          <div className="admin-panel-body text-sm" style={{ color: 'var(--text-muted)' }}>Loading coupons...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-panel-body text-sm" style={{ color: 'var(--text-muted)' }}>No coupons yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td>{c.code}</td>
                    <td>{c.discountType === 'percent' ? 'Percent' : 'Flat'}</td>
                    <td>{c.discountType === 'percent' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}</td>
                    <td>{c.usedCount || 0}/{c.usageLimit || '∞'}</td>
                    <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-status ${c.isActive ? 'success' : 'danger'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="admin-icon-btn" onClick={() => handleDelete(c._id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CouponForm
          onClose={() => setShowForm(false)}
          onSaved={loadCoupons}
        />
      )}
    </div>
  );
}
