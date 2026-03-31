import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCartTotal } from "../redux/cartSlice";

export default function Checkout() {
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
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
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    postal: "",
    address: "",
  });
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!/^\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) next.phone = "Enter a valid phone number";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!/^\d{4,10}$/.test(form.postal)) next.postal = "Enter a valid postal code";
    if (!form.address.trim()) next.address = "Street address is required";
    return next;
  }, [form]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      phone: true,
      email: true,
      city: true,
      state: true,
      postal: true,
      address: true,
    });
    if (Object.keys(errors).length) return;
    navigate('/payment');
  };

  return (
    <div className="section">
      <div className="container">
        <h2 style={{ fontFamily: "'Funnel Sans',serif", fontSize: "1.8rem", marginBottom: "10px" }}>Checkout</h2>
        <div className="checkout-progress">
          <div className="checkout-step done">
            <span>Cart</span>
          </div>
          <div className="checkout-step active">
            <span>Address</span>
          </div>
          <div className="checkout-step">
            <span>Payment</span>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-card">
            <h3 style={{ marginBottom: "14px" }}>Shipping information</h3>
            <form onSubmit={handleSubmit}>
              <div className="profile-grid">
                <div>
                  <input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={touched.name && errors.name ? "input-error" : ""}
                  />
                  {touched.name && errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div>
                  <input
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    className={touched.phone && errors.phone ? "input-error" : ""}
                  />
                  {touched.phone && errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
                <div>
                  <input
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={touched.email && errors.email ? "input-error" : ""}
                  />
                  {touched.email && errors.email && <div className="form-error">{errors.email}</div>}
                </div>
                <div>
                  <input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                    className={touched.city && errors.city ? "input-error" : ""}
                  />
                  {touched.city && errors.city && <div className="form-error">{errors.city}</div>}
                </div>
                <div>
                  <input
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, state: true }))}
                    className={touched.state && errors.state ? "input-error" : ""}
                  />
                  {touched.state && errors.state && <div className="form-error">{errors.state}</div>}
                </div>
                <div>
                  <input
                    placeholder="Postal code"
                    value={form.postal}
                    onChange={(e) => setForm({ ...form, postal: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, postal: true }))}
                    className={touched.postal && errors.postal ? "input-error" : ""}
                  />
                  {touched.postal && errors.postal && <div className="form-error">{errors.postal}</div>}
                </div>
                <div>
                  <input
                    placeholder="Street address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                    className={touched.address && errors.address ? "input-error" : ""}
                  />
                  {touched.address && errors.address && <div className="form-error">{errors.address}</div>}
                </div>
              </div>
              <button className="btn-primary" type="submit">Place order</button>
            </form>
          </div>

          <div className="checkout-card checkout-summary">
            <h3 style={{ marginBottom: "14px" }}>Order summary</h3>
            {items.map((item) => (
              <div key={item._id} className="checkout-item">
                <img src={item.images?.[0]?.url || item.images?.[0] || 'https://via.placeholder.com/56'} alt={item.name} loading="lazy" decoding="async" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Qty {item.qty}</div>
                </div>
                <div>Rs. {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}
