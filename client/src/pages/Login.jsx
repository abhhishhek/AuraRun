import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../redux/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => { if (user) navigate("/"); return () => dispatch(clearError()); }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div style={{padding:"12px 16px",background:"rgba(224,80,80,0.1)",border:"1px solid rgba(224,80,80,0.3)",borderRadius:"8px",color:"#e05050",fontSize:"0.875rem",marginBottom:"20px"}}>
            {error}
          </div>
        )}

        <div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:"8px"}} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-spin"></span> : "Sign In"}
          </button>
        </div>

        <div className="divider"></div>
        <p style={{textAlign:"center",fontSize:"0.875rem",color:"var(--text-muted)"}}>
          Don't have an account?{" "}
          <Link to="/register" style={{color:"var(--accent)",fontWeight:600}}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
