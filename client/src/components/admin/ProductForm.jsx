import { useEffect, useRef, useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Casual Shoes', 'Basketball Shoes', 'Football Shoes', 'Running Shoes', 'Other'];
const parseUrls = (images = '') =>
  images
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

export default function ProductForm({ product, onClose, onSaved, categories = [] }) {
  const categoryOptions = categories.length ? categories : CATEGORIES.map((name) => ({ _id: name, name }));
  const initialCategoryRef = product?.categoryRef?._id || product?.categoryRef || '';
  const initialCategoryName = product?.categoryRef?.name || product?.category || '';
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    comparePrice: product?.comparePrice || '',
    categoryRef: initialCategoryRef,
    category: initialCategoryName,
    brand: product?.brand || '',
    variantGroup: product?.variantGroup || '',
    colorName: product?.colorName || '',
    colorHex: product?.colorHex || '',
    stock: product?.stock || '',
    sizes: product?.sizes?.join(', ') || '',
    images: product?.images?.map((i) => i.url).join(', ') || '',
    isFeatured: product?.isFeatured || false,
    tags: product?.tags || [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState(() => parseUrls(product?.images?.map((i) => i.url).join(', ') || ''));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef(null);
  const draggedIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const orderedImageUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
  const coverUrl = orderedImageUrls[0];
  const galleryThumbs = orderedImageUrls.slice(1);

  const syncImages = (nextUrls) => {
    const cleaned = nextUrls.map((u) => u.trim()).filter(Boolean);
    setImageUrls(cleaned);
    setForm((f) => ({ ...f, images: cleaned.join(', ') }));
  };

  useEffect(() => {
    if (!form.categoryRef && form.category && categories.length) {
      const match = categories.find((c) => c.name?.toLowerCase() === form.category.toLowerCase());
      if (match) {
        setForm((f) => ({ ...f, categoryRef: match._id }));
      }
    }
  }, [categories]);

  useEffect(() => {
    if (!orderedImageUrls.length) {
      setSelectedImageIndex(0);
      return;
    }
    if (selectedImageIndex > orderedImageUrls.length - 1) {
      setSelectedImageIndex(orderedImageUrls.length - 1);
    }
  }, [orderedImageUrls.length, selectedImageIndex]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const selected = categoryOptions.find((c) => c._id === value);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
    setForm((f) => ({
      ...f,
      categoryRef: isObjectId ? value : '',
      category: selected?.name || '',
    }));
  };

  const toggleTag = (tag) => {
    setForm((f) => {
      const exists = f.tags.includes(tag);
      return { ...f, tags: exists ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: Number(form.comparePrice),
        stock: Number(form.stock),
        tags: Array.isArray(form.tags) ? form.tags : [],
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        images: orderedImageUrls.length
          ? orderedImageUrls.map((url) => ({ url }))
          : product?.images || [],
      };
      if (!payload.categoryRef) delete payload.categoryRef;
      if (product) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const data = new FormData();
      files.forEach((f) => data.append('images', f));
      const res = await api.post('/products/upload', data);
      const urls = res.data.map((i) => i.url);
      syncImages([...orderedImageUrls, ...urls]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addImageField = () => {
    fileInputRef.current?.click();
  };

  const updateImageUrl = (index, value) => {
    const next = [...imageUrls];
    next[index] = value;
    setImageUrls(next);
    setForm((f) => ({ ...f, images: next.map((u) => u.trim()).filter(Boolean).join(', ') }));
  };

  const removeImageUrl = (index) => {
    const next = imageUrls.filter((_, i) => i !== index);
    syncImages(next);
  };

  const reorderImageUrls = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= orderedImageUrls.length || toIndex >= orderedImageUrls.length) return;

    const selectedUrl = orderedImageUrls[selectedImageIndex];
    const next = [...orderedImageUrls];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    syncImages(next);

    // Keep the same selected image after reorder to avoid visual "cover replaced" bugs.
    const nextSelectedIndex = selectedUrl ? next.indexOf(selectedUrl) : 0;
    setSelectedImageIndex(nextSelectedIndex >= 0 ? nextSelectedIndex : 0);
  };

  const handleDragStart = (index, e) => {
    draggedIndexRef.current = index;
    setDraggingIndex(index);
    if (e?.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const transferIndex = Number(e.dataTransfer?.getData('text/plain'));
    const fromIndex = Number.isInteger(transferIndex) && transferIndex >= 0 ? transferIndex : draggedIndexRef.current;
    if (!Number.isInteger(fromIndex) || fromIndex < 0) {
      draggedIndexRef.current = null;
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    reorderImageUrls(fromIndex, index);
    draggedIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const addImageFromUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    syncImages([...orderedImageUrls, url]);
    setNewImageUrl('');
    setSelectedImageIndex(orderedImageUrls.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="admin-panel admin-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="admin-card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-panel-body">
          <form onSubmit={handleSubmit} className="admin-form">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Wireless Headphones" className="input-field" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Product description..." className="input-field resize-none" />
          </div>

          {/* Price & Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" placeholder="999" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Compare Price (₹)</label>
              <input name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange} min="0" placeholder="1299" className="input-field" />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <select name="categoryRef" value={form.categoryRef || form.category} onChange={handleCategoryChange} required className="input-field">
                <option value="">Select category</option>
                {categoryOptions.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Sony" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Variant Group</label>
              <input name="variantGroup" value={form.variantGroup} onChange={handleChange} placeholder="e.g. nike-p6000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Color Name</label>
              <input name="colorName" value={form.colorName} onChange={handleChange} placeholder="e.g. Blue Silver" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Color Hex</label>
              <input name="colorHex" value={form.colorHex} onChange={handleChange} placeholder="#2b5aa8" className="input-field" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stock Quantity *</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" placeholder="100" className="input-field" />
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Available Sizes (comma separated)</label>
            <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="UK 6, UK 7, UK 8" className="input-field" />
          </div>

{/* Images */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Media
            </label>
            <div className="admin-media-gallery-wrap">
              <div className="admin-media-gallery">
                <div
                  className="admin-media-main"
                  onDragOver={(e) => handleDragOver(e, 0)}
                  onDrop={(e) => handleDrop(e, 0)}
                  onDragEnd={handleDragEnd}
                >
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover preview" />
                  ) : (
                    <span>No image selected</span>
                  )}
                  {!!orderedImageUrls.length && (
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStart(0, e)}
                      onDragEnd={handleDragEnd}
                      className="admin-media-action drag-handle cover-handle"
                      title="Drag cover image"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical size={14} />
                    </button>
                  )}
                </div>

                <div className="admin-media-grid">
                  {galleryThumbs.map((url, thumbIndex) => {
                    const imageIndex = thumbIndex + 1;
                    return (
                    <div
                      key={`${url}-${imageIndex}`}
                      className={`admin-media-thumb ${dragOverIndex === imageIndex ? 'is-over' : ''} ${draggingIndex === imageIndex ? 'is-dragging' : ''}`}
                      onDragOver={(e) => handleDragOver(e, imageIndex)}
                      onDrop={(e) => handleDrop(e, imageIndex)}
                      onDragEnd={handleDragEnd}
                    >
                      <img src={url} alt={`Media ${imageIndex + 1}`} draggable={false} />
                      <div className="admin-media-overlay" />
                      <div className="admin-media-badge">#{imageIndex + 1}</div>

                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => handleDragStart(imageIndex, e)}
                        onDragEnd={handleDragEnd}
                        className="admin-media-action drag-handle"
                        title="Drag to reorder"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageUrl(imageIndex);
                        }}
                        className="admin-media-action remove-btn"
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )})}

                  <button type="button" onClick={addImageField} className="admin-media-add" title="Upload image">
                    +
                  </button>
                </div>
              </div>

              <div className="admin-media-url-row">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste image URL and click Add URL"
                  className="input-field"
                />
                <button type="button" onClick={addImageFromUrl} className="btn-secondary px-4 py-2">
                  Add URL
                </button>
              </div>

              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              {uploading && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Uploading...</p>}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                First image is used as cover. Drag thumbnails to change sequence for the remaining images.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tags</label>
            <div className="admin-tag-grid">
              {['New Arrival', 'Bestseller', 'Trending'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`admin-tag-pill ${form.tags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
            <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              Mark as Featured Product
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
