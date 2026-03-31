import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Tag, X } from 'lucide-react';
import { selectCartTotal } from '../../redux/cartSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CartSummary() {
  const { items } = useSelector((s) => s.cart);
  const subtotal = useSelector(selectCartTotal);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = subtotal + shipping + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setAppliedCoupon(data);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  return (
    <div className="card p-6 sticky top-24">
      <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
        Order Summary
      </h2>

      {/* Coupon */}
      <div className="mb-5">
        {appliedCoupon ? (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}>
            <div className="flex items-center gap-2">
              <Tag size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{appliedCoupon.coupon.code}</span>
              <span className="text-xs" style={{ color: 'var(--accent)' }}>(-₹{discount})</span>
            </div>
            <button onClick={removeCoupon} style={{ color: 'var(--accent)' }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="input-field flex-1"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode}
              className="btn-secondary px-4 disabled:opacity-50"
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({items.length} items)</span>
          <span style={{ color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
          <span style={{ color: shipping === 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
          <span style={{ color: 'var(--text-primary)' }}>₹{tax.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--accent)' }}>Discount</span>
            <span style={{ color: 'var(--accent)' }}>-₹{discount.toLocaleString()}</span>
          </div>
        )}
        <hr style={{ borderColor: 'var(--border)' }} />
        <div className="flex justify-between text-base font-bold">
          <span style={{ color: 'var(--text-primary)' }}>Total</span>
          <span style={{ color: 'var(--text-primary)' }}>₹{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {subtotal < 999 && (
        <p className="text-xs mt-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
          Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
        </p>
      )}

      <Link
        to="/checkout"
        state={{ couponCode: appliedCoupon?.coupon?.code }}
        className="btn-primary w-full mt-5 py-3.5 justify-center"
      >
        Proceed to Checkout <ArrowRight size={15} />
      </Link>

      <Link to="/products" className="btn-secondary w-full mt-3 py-3 justify-center text-sm">
        Continue Shopping
      </Link>
    </div>
  );
}
