import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const activeToken = useMemo(() => tokenFromUrl || tokenInput.trim(), [tokenFromUrl, tokenInput]);
  const hasToken = Boolean(activeToken);

  const requestReset = async () => {
    if (!email.trim()) return;
    try {
      setLoading(true);
      setMessage('');
      await api.post('/auth/forgot-password', { email: email.trim() });
      setMessage('Reset email sent. Open the email link to set a new password.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!activeToken || !password.trim()) return;
    try {
      setLoading(true);
      setMessage('');
      await api.post('/auth/reset-password', { token: activeToken, password: password.trim() });
      setMessage('Password updated successfully. You can login now.');
      setPassword('');
      setTokenInput('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 className="section-title">Forgot Password</h1>
        <p className="section-subtitle">
          {!hasToken
            ? 'Enter your email to receive a password reset link.'
            : 'Enter your new password to complete reset.'}
        </p>

        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          {!hasToken && (
            <>
              <input
                className="input-field"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={requestReset}
                disabled={loading || !email.trim()}
              >
                {loading ? 'Sending...' : 'Send reset email'}
              </button>
            </>
          )}

          {hasToken && (
            <>
              {!tokenFromUrl && (
                <input
                  className="input-field"
                  placeholder="Reset token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
              )}
              <input
                className="input-field"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={resetPassword}
                disabled={loading || !password.trim() || !activeToken}
              >
                {loading ? 'Updating...' : 'Set new password'}
              </button>
            </>
          )}

          {message && <p style={{ color: 'var(--text-muted)' }}>{message}</p>}
          <Link to="/login" className="btn btn-ghost">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
