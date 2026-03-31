import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQty, selectCartTotal } from "../redux/cartSlice";
import { toggleWishlistAsync } from "../redux/wishlistSlice";
import { getCategoryName } from "../utils/product";
import api from "../utils/api";
import { Check } from "lucide-react";

export default function Cart() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    api.post('/coupons/validate', { code, orderAmount: total })
      .then(({ data }) => {
        const amount = Math.max(0, Math.min(Number(data.discount) || 0, total));
        setDiscount(amount);
        setCouponMsg(`Coupon applied! You saved Rs. ${amount.toLocaleString()}`);
        localStorage.setItem('appliedCoupon', JSON.stringify(data.coupon));
        setCouponApplied(true);
      })
      .catch((err) => {
        setDiscount(0);
        localStorage.removeItem('appliedCoupon');
        setCouponMsg(err.response?.data?.message || "Failed to apply coupon");
        setCouponApplied(false);
      });
  };

  const finalTotal = total - discount;
  const shipping = total > 999 ? 0 : 99;

  if (!items.length) return (
    <div className="section">
      <div className="container flex-center" style={{flexDirection:"column",gap:"16px",minHeight:"400px"}}>
        <div className="empty-illustration">Empty</div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem"}}>Your cart is empty</h2>
        <p style={{color:"var(--text-muted)"}}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="section">
      <div className="container">
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"2rem",marginBottom:"32px"}}>Shopping Cart <span style={{color:"var(--text-muted)",fontSize:"1rem",fontFamily:"'DM Sans',sans-serif"}}>({items.length} items)</span></h1>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.cartKey || item._id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.images?.[0]?.url || item.images?.[0] || "https://placehold.co/100"} alt={item.name} loading="lazy" decoding="async" />
                </div>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontWeight:600,marginBottom:"4px"}}>{item.name}</div>
                  <div style={{fontSize:"0.82rem",color:"var(--text-muted)",marginBottom:"12px"}}>{getCategoryName(item)}</div>
                  {(item.selectedSize || item.selectedColor) && (
                    <div style={{fontSize:"0.78rem",color:"var(--text-muted)",marginBottom:"10px"}}>
                      {item.selectedSize ? `Size: ${item.selectedSize}` : ''}{item.selectedSize && item.selectedColor ? ' · ' : ''}{item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                    </div>
                  )}
                  <div className="qty-control" style={{display:"inline-flex"}}>
                    <button className="qty-btn" onClick={() => item.qty > 1 ? dispatch(updateQty({id:item.cartKey || item._id,qty:item.qty-1})) : dispatch(removeFromCart(item.cartKey || item._id))}>−</button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn" onClick={() => dispatch(updateQty({id:item.cartKey || item._id,qty:item.qty+1}))}>+</button>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,marginBottom:"8px"}}>₹{(item.price*item.qty).toLocaleString()}</div>
                  <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
                    <button onClick={() => dispatch(removeFromCart(item.cartKey || item._id))} style={{background:"none",border:"none",color:"var(--text-muted)",fontSize:"0.8rem",cursor:"pointer"}}>Remove</button>
                    <button
                      onClick={() => { dispatch(toggleWishlistAsync(item)); dispatch(removeFromCart(item.cartKey || item._id)); }}
                      style={{background:"none",border:"none",color:"var(--accent)",fontSize:"0.8rem",cursor:"pointer"}}
                    >
                      Save for later
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",marginBottom:"16px"}}>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
            {discount > 0 && <div className="summary-row" style={{color:"#3aac7a"}}><span>Coupon</span><span>-Rs. {discount.toLocaleString()}</span></div>}
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{color:"#3aac7a"}}>Free</span> : `₹${shipping}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{(finalTotal+shipping).toLocaleString()}</span></div>

            <div className="coupon-input">
              <input placeholder="Coupon code" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponApplied(false); }} />
              <button className="btn btn-secondary btn-sm" onClick={applyCoupon} disabled={couponApplied}>
                {couponApplied ? (
                  <span className="flex items-center gap-2">
                    <Check size={14} /> Applied
                  </span>
                ) : 'Apply'}
              </button>
            </div>
            {couponMsg && <p style={{fontSize:"0.78rem",color:couponMsg.includes("Invalid")?"#e05050":"#3aac7a",marginBottom:"16px"}}>{couponMsg}</p>}

            <Link to="/checkout" className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:"8px"}}>
              Proceed to Checkout →
            </Link>
            {shipping > 0 && <p style={{fontSize:"0.75rem",color:"var(--text-muted)",marginTop:"12px",textAlign:"center"}}>Add Rs. {(999-total).toLocaleString()} more for free shipping</p>}
          </div>
        </div>

        <div className="trust-strip cart-trust">
          <div className="trust-card">
            <div className="trust-title">Why shop with us</div>
            <ul>
              <li>Free returns within 30 days</li>
              <li>Secure payments and fast refunds</li>
              <li>Trusted by 50k+ customers</li>
            </ul>
          </div>
          <div className="trust-card">
            <div className="trust-title">Verified reviews</div>
            <p>4.7 out of 5 average rating</p>
            <span>Based on verified purchases</span>
          </div>
        </div>
      </div>
    </div>
  );
}
