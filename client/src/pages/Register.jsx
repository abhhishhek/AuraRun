import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../redux/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = useState("");

  useEffect(() => { if (user) navigate("/"); return () => dispatch(clearError()); }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setLocalError("Passwords do not match"); return; }
    setLocalError("");
    dispatch(register({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join us and start shopping</p>

        {(error || localError) && (
          <div style={{padding:"12px 16px",background:"rgba(224,80,80,0.1)",border:"1px solid rgba(224,80,80,0.3)",borderRadius:"8px",color:"#e05050",fontSize:"0.875rem",marginBottom:"20px"}}>
            {error || localError}
          </div>
        )}

        <div>
          {["name","email","password","confirmPassword"].map((field) => (
            <div className="form-group" key={field}>
              <label className="form-label">{field === "confirmPassword" ? "Confirm Password" : field.charAt(0).toUpperCase()+field.slice(1)}</label>
              <input className="form-input"
                type={field.includes("password") || field === "confirmPassword" ? "password" : field === "email" ? "email" : "text"}
                placeholder={field === "name" ? "Your full name" : field === "email" ? "you@example.com" : "••••••••"}
                value={form[field]}
                onChange={(e) => setForm({...form, [field]: e.target.value})}
              />
            </div>
          ))}
          <button className="btn btn-primary" style={{width:"100%",marginTop:"8px"}} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-spin"></span> : "Create Account"}
          </button>
        </div>

        <div className="divider"></div>
        <p style={{textAlign:"center",fontSize:"0.875rem",color:"var(--text-muted)"}}>
          Already have an account?{" "}
          <Link to="/login" style={{color:"var(--accent)",fontWeight:600}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
