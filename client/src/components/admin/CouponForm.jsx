import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CouponForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/coupons', {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      });
      toast.success('Coupon created!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="admin-panel w-full max-w-lg animate-scale-in">
        <div className="admin-card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Create Coupon</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-panel-body">
          <form onSubmit={handleSubmit} className="admin-form">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Coupon Code *</label>
            <input name="code" value={form.code} onChange={handleChange} required placeholder="e.g. SAVE20" className="input-field uppercase" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Discount Type *</label>
              <select name="discountType" value={form.discountType} onChange={handleChange} className="input-field">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Discount Value ({form.discountType === 'percent' ? '%' : 'Rs.'}) *
              </label>
              <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} required min="1" placeholder="20" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Min Order Amount (Rs.)</label>
              <input name="minOrderAmount" type="number" value={form.minOrderAmount} onChange={handleChange} min="0" placeholder="500" className="input-field" />
            </div>
            {form.discountType === 'percent' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Discount (Rs.)</label>
                <input name="maxDiscount" type="number" value={form.maxDiscount} onChange={handleChange} min="0" placeholder="500" className="input-field" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Usage Limit</label>
              <input name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} min="1" placeholder="Unlimited" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expiry Date *</label>
              <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required className="input-field" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
            <label htmlFor="isActive" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              Activate coupon immediately
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
