import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function ManageAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements/admin');
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditing(null);
    setMessage('');
  };

  const startEdit = (item) => {
    setEditing(item);
    setMessage(item.message);
  };

  const handleSave = async () => {
    if (!message.trim()) return toast.error('Message is required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/announcements/${editing._id}`, { message });
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', { message, isActive: true });
        toast.success('Announcement created');
      }
      await load();
      startCreate();
      const { data } = await api.get('/announcements');
      localStorage.setItem('announcements', JSON.stringify(data));
      window.dispatchEvent(new Event('announcements-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      const next = items.filter((i) => i._id !== id);
      setItems(next);
      const { data } = await api.get('/announcements');
      localStorage.setItem('announcements', JSON.stringify(data));
      window.dispatchEvent(new Event('announcements-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/announcements/${item._id}`, { isActive: !item.isActive });
      await load();
      const { data } = await api.get('/announcements');
      localStorage.setItem('announcements', JSON.stringify(data));
      window.dispatchEvent(new Event('announcements-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Announcement</p>
          <h1 className="admin-page-title">Announcement Bar</h1>
        </div>
        <div className="admin-page-actions">
          <button className="btn-secondary px-4 py-2" onClick={startCreate}>
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="admin-panel">
            <div className="admin-card-header">
              <h3>Announcements</h3>
            </div>
            {loading ? (
              <div className="admin-panel-body text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
            ) : items.length === 0 ? (
              <div className="admin-panel-body text-sm" style={{ color: 'var(--text-muted)' }}>No announcements yet.</div>
            ) : (
              <div className="admin-list">
                {items.map((item) => (
                  <div key={item._id} className="admin-list-item">
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.message}</p>
                      <p className="admin-list-meta">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary px-3 py-2" onClick={() => toggleActive(item)}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button className="btn-secondary px-3 py-2" onClick={() => startEdit(item)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn-secondary px-3 py-2" onClick={() => handleDelete(item._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-card-header">
            <h3>{editing ? 'Edit Announcement' : 'Create Announcement'}</h3>
          </div>
          <div className="admin-panel-body">
            <div className="admin-form">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Type announcement message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="admin-form-actions">
                {editing && (
                  <button className="btn-secondary flex-1" onClick={startCreate}>
                    Cancel
                  </button>
                )}
                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
