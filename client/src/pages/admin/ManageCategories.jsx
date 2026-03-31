import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const DEFAULT_CATEGORIES = [
  'Casual Shoes',
  'Basketball Shoes',
  'Football Shoes',
  'Running Shoes',
];

export default function ManageCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', image: '' });
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      await loadCategories();
      startCreate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${catId}`);
      toast.success('Category deleted');
      setItems((prev) => prev.filter((c) => c._id !== catId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const seedDefaults = async () => {
    try {
      for (const name of DEFAULT_CATEGORIES) {
        await api.post('/categories', { name });
      }
      toast.success('Default categories added');
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed categories');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Categories</p>
          <h1 className="admin-page-title">Category Management</h1>
        </div>
        <div className="admin-page-actions">
          <button className="btn-secondary px-4 py-2" onClick={seedDefaults}>Add Default Categories</button>
          <button className="btn-primary px-4 py-2" onClick={startCreate}>
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="admin-panel">
            <div className="admin-card-header">
              <h3>All Categories</h3>
            </div>
            {loading ? (
              <div className="admin-panel-body text-sm" style={{ color: 'var(--text-muted)' }}>Loading categories...</div>
            ) : items.length === 0 ? (
              <div className="admin-panel-body text-sm" style={{ color: 'var(--text-muted)' }}>No categories yet.</div>
            ) : (
              <div className="admin-list">
                {items.map((cat) => (
                  <div key={cat._id} className="admin-list-item">
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                      <p className="admin-list-meta truncate">{cat.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary px-3 py-2" onClick={() => startEdit(cat)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn-secondary px-3 py-2" onClick={() => handleDelete(cat._id)}>
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
            <h3>{editing ? 'Edit Category' : 'Create Category'}</h3>
          </div>
          <div className="admin-panel-body">
            <form className="admin-form" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input
                  className="input-field"
                  value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g. Running Shoes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Image URL</label>
                <input
                  className="input-field"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="admin-form-actions">
                {editing && (
                  <button type="button" className="btn-secondary flex-1 py-2" onClick={startCreate}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary flex-1 py-2" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
