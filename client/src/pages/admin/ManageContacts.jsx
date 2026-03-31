import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ManageContacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contacts', {
        params: {
          search,
          status,
        },
      });
      setItems(data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load contact requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
  }, [search, status]);

  const counts = useMemo(() => ({
    new: items.filter((i) => i.status === 'new').length,
    in_progress: items.filter((i) => i.status === 'in_progress').length,
    resolved: items.filter((i) => i.status === 'resolved').length,
  }), [items]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await api.put(`/contacts/${id}`, { status: nextStatus });
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, status: nextStatus } : item)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this contact request?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Support</p>
          <h1 className="admin-page-title">Contact Requests</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="admin-panel"><div className="admin-panel-body"><p className="stat-label">New</p><p className="stat-value">{counts.new}</p></div></div>
        <div className="admin-panel"><div className="admin-panel-body"><p className="stat-label">In Progress</p><p className="stat-value">{counts.in_progress}</p></div></div>
        <div className="admin-panel"><div className="admin-panel-body"><p className="stat-label">Resolved</p><p className="stat-value">{counts.resolved}</p></div></div>
      </div>

      <div className="admin-toolbar card">
        <div className="admin-search">
          <Search size={16} />
          <input
            placeholder="Search name, email, phone, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-filter">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden admin-table-card">
        {loading ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading contact requests...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>No contact requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div>
                        <div className="admin-product-name">{item.name}</div>
                        <div className="admin-product-meta">{item.email}</div>
                        {item.phone && <div className="admin-product-meta">{item.phone}</div>}
                      </div>
                    </td>
                    <td>{item.subject || '-'}</td>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ whiteSpace: 'normal', lineHeight: 1.5 }}>
                        {item.message}
                      </div>
                    </td>
                    <td>
                      <select
                        className="input-field"
                        value={item.status}
                        onChange={(e) => updateStatus(item._id, e.target.value)}
                        style={{ minWidth: 130, height: 36 }}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="text-right">
                      <button className="admin-icon-btn" onClick={() => removeItem(item._id)} title="Delete">
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
    </div>
  );
}
