import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCartTotal } from '../redux/cartSlice';
import toast from 'react-hot-toast';

export default function Payment() {
  const total = useSelector(selectCartTotal);
  const shipping = total > 999 ? 0 : 99;
  const tax = Math.round(total * 0.18);
  const appliedCoupon = (() => {
    try { return JSON.parse(localStorage.getItem('appliedCoupon') || 'null'); } catch { return null; }
  })();
  const couponDiscount = (() => {
    if (!appliedCoupon) return 0;
    if (!appliedCoupon.isActive) return 0;
    if (appliedCoupon.expiryDate && new Date(appliedCoupon.expiryDate) < new Date()) return 0;
    if (appliedCoupon.minOrderAmount && total < Number(appliedCoupon.minOrderAmount)) return 0;
    if (appliedCoupon.discountType === 'percent') {
      let amount = Math.round((total * Number(appliedCoupon.discountValue)) / 100);
      if (appliedCoupon.maxDiscount) amount = Math.min(amount, Number(appliedCoupon.maxDiscount));
      return Math.min(amount, total);
    }
    return Math.min(Number(appliedCoupon.discountValue) || 0, total);
  })();
  const grand = total - couponDiscount + shipping + tax;
  const [form, setForm] = useState({
    name: '',
    card: '',
    expiry: '',
    cvv: '',
    upi: '',
    method: 'card',
  });

  const handlePay = (e) => {
    e.preventDefault();
    toast.success('This is a dummy payment page.');
  };

  return (
    <div className="section">
      <div className="container">
        <div className="admin-page-header" style={{ marginBottom: 24 }}>
          <div>
            <p className="admin-page-kicker">Payment</p>
            <h1 className="admin-page-title">Complete your payment</h1>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="admin-panel">
            <div className="admin-card-header">
              <h3>Payment Method</h3>
            </div>
            <div className="admin-panel-body">
              <form className="admin-form" onSubmit={handlePay}>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`btn-secondary flex-1 ${form.method === 'card' ? 'active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, method: 'card' }))}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary flex-1 ${form.method === 'upi' ? 'active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, method: 'upi' }))}
                  >
                    UPI
                  </button>
                </div>

                {form.method === 'card' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name on card</label>
                      <input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Card number</label>
                      <input className="input-field" value={form.card} onChange={(e) => setForm((f) => ({ ...f, card: e.target.value }))} placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expiry</label>
                        <input className="input-field" value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))} placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>CVV</label>
                        <input className="input-field" value={form.cvv} onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value }))} placeholder="123" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>UPI ID</label>
                    <input className="input-field" value={form.upi} onChange={(e) => setForm((f) => ({ ...f, upi: e.target.value }))} placeholder="name@upi" />
                  </div>
                )}

                <div className="admin-form-actions">
                  <button type="submit" className="btn-primary flex-1 py-3">
                    Pay Rs. {grand.toLocaleString()}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-card-header">
              <h3>Order Summary</h3>
            </div>
            <div className="admin-panel-body">
              <div className="checkout-row"><span>Subtotal</span><span>Rs. {total.toLocaleString()}</span></div>
              {couponDiscount > 0 && (
                <div className="checkout-row" style={{ color: '#3aac7a' }}>
                  <span>Coupon ({appliedCoupon?.code || ''})</span>
                  <span>-Rs. {couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="checkout-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
              <div className="checkout-row"><span>Tax (18%)</span><span>Rs. {tax.toLocaleString()}</span></div>
              <div className="checkout-row" style={{ fontWeight: 700 }}><span>Total</span><span>Rs. {grand.toLocaleString()}</span></div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                This is a demo payment screen. No real transaction will be processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
