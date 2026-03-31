import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || 'Abhishek',
    lastName: user?.name?.split(' ').slice(1).join(' ') || 'Pandey',
    email: user?.email || 'abhishek@example.com',
    phone: user?.phone || '+91 90000 12345',
    address: '22 Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700016',
  });
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => {
      const addr = data.addresses?.[0] || {};
      setForm((f) => ({
        ...f,
        firstName: data.name?.split(' ')[0] || f.firstName,
        lastName: data.name?.split(' ').slice(1).join(' ') || f.lastName,
        email: data.email || f.email,
        address: addr.street || f.address,
        city: addr.city || f.city,
        state: addr.state || f.state,
        postalCode: addr.postalCode || f.postalCode,
      }));
    }).catch(() => {});
    api.get('/orders/myorders').then(({ data }) => setOrders(data || [])).catch(() => {});
    try {
      const rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(rv.slice(0, 4));
    } catch {}
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('verifyToken');
    if (tokenFromUrl) {
      setVerifyToken(tokenFromUrl);
      setVerifyMsg('Verification token loaded from email link. Click "Verify email".');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm('This will permanently delete your account. Continue?');
    if (!ok) return;
    try {
      await api.delete('/auth/profile');
      dispatch(logout());
      toast.success('Account deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <aside className="profile-sidebar">
          <h2>My Account</h2>
          <nav>
            <button className="active">My details</button>
            <button>Orders</button>
            <button>Addresses</button>
            <button>Security</button>
            <button className="danger" onClick={handleDeleteAccount}>Sign out & delete account</button>
          </nav>
        </aside>

        <main className="profile-content">
          <div className="profile-card">
            <h3>My details</h3>
            <p>Update your personal information and contact preferences.</p>
            <div className="profile-grid">
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
            </div>
            <button className="btn-primary">Save changes</button>
          </div>

          <div className="profile-card">
            <h3>Default address</h3>
            <p>This address is used for your recent orders and deliveries.</p>
            <div className="profile-grid">
              <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
              <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
              <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal code" />
            </div>
            <button
              className="btn-secondary"
              onClick={() => api.put('/auth/profile', {
                name: `${form.firstName} ${form.lastName}`.trim(),
                email: form.email,
                addresses: [{
                  street: form.address,
                  city: form.city,
                  state: form.state,
                  postalCode: form.postalCode,
                  isDefault: true,
                }],
              })}
            >
              Update address
            </button>
          </div>

          <div className="profile-card">
            <h3>Order history</h3>
            <p>Track your recent purchases and delivery status.</p>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
            ) : (
              <div className="profile-orders">
                {orders.map((o) => (
                  <div key={o._id} className="profile-order-row">
                    <span>#{o._id.slice(-6).toUpperCase()}</span>
                    <span>₹{o.totalPrice?.toLocaleString()}</span>
                    <span>{o.status}</span>
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-card">
            <h3>Email verification</h3>
            <p>Verify your email to unlock order updates and account recovery.</p>
            <div className="profile-grid">
              <input
                placeholder="Verification token"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={async () => {
                  try {
                    await api.post('/auth/request-verify', { email: form.email });
                    setVerifyMsg('Verification email sent. Check your inbox.');
                  } catch (err) {
                    setVerifyMsg(err.response?.data?.message || 'Failed to request verification');
                  }
                }}
              >
                Request token
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  try {
                    await api.post('/auth/verify-email', { token: verifyToken });
                    setVerifyMsg('Email verified!');
                  } catch (err) {
                    setVerifyMsg(err.response?.data?.message || 'Verification failed');
                  }
                }}
              >
                Verify email
              </button>
            </div>
            {verifyMsg && <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{verifyMsg}</p>}
          </div>

          <div className="profile-card">
            <h3>Recently viewed</h3>
            <p>Quick access to items you browsed recently.</p>
            {recentlyViewed.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nothing viewed yet.</p>
            ) : (
              <div className="profile-recent-grid">
                {recentlyViewed.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
