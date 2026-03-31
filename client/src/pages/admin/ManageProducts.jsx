import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, Search, SlidersHorizontal, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ProductForm from '../../components/admin/ProductForm';
import { getCategoryName } from '../../utils/product';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [importingCsv, setImportingCsv] = useState(false);
  const csvInputRef = useRef(null);

  const categoryNames = useMemo(
    () => ['All', ...categories.map((c) => c.name)],
    [categories]
  );

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { limit: 200 } });
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch {}
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setShowForm(true);
  };

  const filtered = products.filter((p) => {
    const matchQuery =
      !query ||
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.brand?.toLowerCase().includes(query.toLowerCase());
    const matchCategory =
      categoryFilter === 'All' || getCategoryName(p) === categoryFilter;
    return matchQuery && matchCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'stock') return b.stock - a.stock;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((p) => p._id));
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/products/${id}`)));
      toast.success('Products deleted');
      setSelectedIds([]);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete products');
    }
  };

  const bulkUpdate = async () => {
    if (!selectedIds.length) return;
    const payload = {};
    if (bulkPrice !== '') payload.price = Number(bulkPrice);
    if (bulkStock !== '') payload.stock = Number(bulkStock);
    if (!Object.keys(payload).length) return;
    try {
      await api.put('/products/bulk-update', {
        ids: selectedIds,
        updates: payload,
      });
      toast.success('Products updated');
      setBulkPrice('');
      setBulkStock('');
      setSelectedIds([]);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update products');
    }
  };

  const exportProductsCsv = () => {
    const safe = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['ProductId', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Status', 'CreatedAt'],
      ...filtered.map((p) => [
        p._id,
        p.name,
        p.brand || '',
        getCategoryName(p) || '',
        p.price ?? 0,
        p.stock ?? 0,
        (p.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
        p.createdAt ? new Date(p.createdAt).toISOString() : '',
      ]),
    ];

    const csv = rows.map((row) => row.map(safe).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} product${filtered.length === 1 ? '' : 's'}`);
  };

  const triggerCsvImport = () => csvInputRef.current?.click();

  const handleCsvImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      e.target.value = '';
      return;
    }

    try {
      setImportingCsv(true);
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/products/bulk-update-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const msg = `Updated ${data.updatedCount}/${data.totalRows} rows`;
      if (data.failedCount > 0) toast.success(`${msg}. Failed: ${data.failedCount}`);
      else toast.success(msg);
      await loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV import failed');
    } finally {
      setImportingCsv(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Products</p>
          <h1 className="admin-page-title">Products List</h1>
        </div>
        <div className="admin-page-actions">
          <button className="admin-ghost-btn" onClick={exportProductsCsv}>
            <Download size={16} />
            Export
          </button>
          <button className="admin-ghost-btn" onClick={triggerCsvImport} disabled={importingCsv}>
            <Upload size={16} />
            {importingCsv ? 'Importing...' : 'Import CSV'}
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            style={{ display: 'none' }}
          />
          <button className="btn-primary px-4 py-2" onClick={openCreate}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="admin-toolbar card">
        <div className="admin-filter">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Bulk actions
          </span>
        </div>
        <div className="admin-search">
          <Search size={16} />
          <input
            placeholder="Search product, brand..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="admin-filter">
          <SlidersHorizontal size={16} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categoryNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="admin-filter">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock</option>
          </select>
        </div>
        <div className="admin-filter">
          <input
            type="number"
            placeholder="Bulk price"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
          />
        </div>
        <div className="admin-filter">
          <input
            type="number"
            placeholder="Bulk stock"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
          />
        </div>
        <button
          className="admin-ghost-btn"
          onClick={bulkUpdate}
          disabled={selectedIds.length === 0 || (bulkPrice === '' && bulkStock === '')}
          style={{ opacity: selectedIds.length === 0 || (bulkPrice === '' && bulkStock === '') ? 0.5 : 1 }}
        >
          Apply to selected ({selectedIds.length})
        </button>
        <button
          className="admin-ghost-btn"
          onClick={bulkDelete}
          disabled={selectedIds.length === 0}
          style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}
        >
          Delete selected ({selectedIds.length})
        </button>
      </div>

      <div className="card overflow-hidden admin-table-card">
        {loading ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>No products yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = p.stock > 0 ? 'In Stock' : 'Out of Stock';
                  const statusClass = p.stock > 0 ? 'success' : 'danger';
                  return (
                    <tr key={p._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                      />
                    </td>
                    <td>
                      <div className="admin-product">
                          <img
                            src={p.images?.[0]?.url || 'https://via.placeholder.com/48'}
                            alt={p.name}
                          />
                          <div>
                            <div className="admin-product-name">{p.name}</div>
                            <div className="admin-product-meta">{p.brand || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{getCategoryName(p) || '—'}</td>
                      <td>â‚¹{p.price.toLocaleString()}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={`admin-status ${statusClass}`}>{status}</span>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="admin-action-group">
                          <button className="admin-icon-btn" onClick={() => openEdit(p)}>
                            <Pencil size={14} />
                          </button>
                          <button className="admin-icon-btn" onClick={() => handleDelete(p._id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={loadProducts}
        />
      )}
    </div>
  );
}
