import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Package } from 'lucide-react';
import { loginUser, registerUser, verifySignupOtp, clearError } from '../redux/authSlice';
import toast from 'react-hot-toast';

function AuthForm({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, pendingSignupEmail } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) {
      toast.success(mode === 'login' ? 'Signed in successfully.' : 'Account verified, welcome!');
      navigate('/');
    }
  }, [user, navigate, mode]);

  useEffect(() => {
    if (mode === 'register' && pendingSignupEmail && !user) {
      setAwaitingOtp(true);
    }
  }, [mode, pendingSignupEmail, user]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => dispatch(clearError());
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      dispatch(loginUser({ email: form.email, password: form.password }));
      return;
    }
    if (awaitingOtp) {
      dispatch(verifySignupOtp({ email: form.email, otp }));
      return;
    }
    dispatch(registerUser(form))
      .unwrap()
      .then(() => {
        toast.success('OTP sent to your email');
        setAwaitingOtp(true);
      })
      .catch(() => {});
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-illustration">
          <div className="auth-illustration-overlay">
            <p className="auth-ill-eyebrow">Member Exclusive</p>
            <h2 className="auth-ill-heading">Run the game.<br />Not just the race.</h2>
            <p className="auth-ill-copy">Sign in to unlock drops, faster checkout and saved favourites.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <Package size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Aura<span style={{ color: 'var(--accent)' }}>Run</span>
            </span>
          </div>

          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome back' : awaitingOtp ? 'Verify your OTP' : 'Create your Aura ID'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to unlock your member perks.'
              : awaitingOtp
                ? 'Enter the 6-digit OTP sent to your email to complete signup.'
                : 'Join for faster checkout and exclusive sneaker drops.'}
          </p>

          {!awaitingOtp && (
            <div className="auth-social-row">
            <button type="button" className="btn btn-secondary auth-social-btn">
              <span className="auth-social-logo">G</span>
              <span>Continue with Google</span>
            </button>
            <button type="button" className="btn btn-secondary auth-social-btn">
              <span className="auth-social-logo">f</span>
              <span>Continue with Facebook</span>
            </button>
            </div>
          )}

          {!awaitingOtp && (
            <div className="auth-divider">
            <span>or use email</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {mode === 'register' && !awaitingOtp && (
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
            )}
            {!awaitingOtp && (
              <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="form-input"
              />
              </div>
            )}
            {!awaitingOtp && (
              <div>
              <div className="flex items-center justify-between">
                <label className="form-label">Password</label>
                {mode === 'login' && (
                  <Link
                    to="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="********"
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="auth-eye-toggle"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              </div>
            )}
            {awaitingOtp && (
              <>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="form-input opacity-70"
                  />
                </div>
                <div>
                  <label className="form-label">OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="form-input"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : awaitingOtp ? 'Verify OTP & Sign Up' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footnote">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={mode === 'login' ? '/register' : '/login'}
              style={{ color: 'var(--accent)' }}
              className="font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;


