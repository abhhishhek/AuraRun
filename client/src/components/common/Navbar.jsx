import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { logout } from "../../redux/authSlice";
import { selectCartCount } from "../../redux/cartSlice";
import { useEffect, useState } from "react";
import { fetchWishlist } from "../../redux/wishlistSlice";
import api from "../../utils/api";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [user, dispatch]);

  useEffect(() => {
    const cached = localStorage.getItem('announcements');
    if (cached) {
      try { setAnnouncements(JSON.parse(cached)); } catch {}
    }
    api.get('/announcements')
      .then(({ data }) => {
        setAnnouncements(data || []);
        localStorage.setItem('announcements', JSON.stringify(data || []));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const next = JSON.parse(localStorage.getItem('announcements') || '[]');
        setAnnouncements(next);
      } catch { setAnnouncements([]); }
    };
    window.addEventListener('announcements-updated', handler);
    return () => window.removeEventListener('announcements-updated', handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('has-announcement', announcements.length > 0);
  }, [announcements]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      {announcements.length > 0 && (
        <div className="announcement-bar">
          <div className="announcement-track">
            {announcements.map((a) => (
              <span key={a._id}>{a.message}</span>
            ))}
            {announcements.map((a) => (
              <span key={`${a._id}-repeat`}>{a.message}</span>
            ))}
          </div>
        </div>
      )}

      <nav className="navbar" style={{ top: announcements.length > 0 ? 32 : 0 }}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">Aura<span>.</span></Link>

          <div className="navbar-nav">
            <NavLink to="/products" className="nav-link">Shop</NavLink>
          </div>

          <form className="navbar-search" onSubmit={handleSearch}>
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="navbar-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
          </form>

          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>

            {user && (
              <Link to="/wishlist" className="nav-icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
              </Link>
            )}

            <Link to="/cart" className="nav-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              {(user.role === "admin" || user.role === "editor") && (
                <Link to="/admin" className="btn btn-sm btn-ghost">
                  {user.role === "editor" ? "Editor" : "Admin"}
                </Link>
              )}
                <Link to="/profile" className="nav-icon-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
                <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div style={{display:"flex",gap:"8px"}}>
                <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
                <Link to="/register" className="btn btn-sm btn-primary">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="mobile-bottom-nav">
        <NavLink to="/" end className="mobile-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/></svg>
          <span>Home</span>
        </NavLink>
        <NavLink to="/products" className="mobile-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2h12l2 7H4l2-7Z"/><path d="M4 9h16v11H4z"/></svg>
          <span>Shop</span>
        </NavLink>
        <NavLink to="/wishlist" className="mobile-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>Wishlist</span>
        </NavLink>
        <NavLink to="/cart" className="mobile-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span>Cart</span>
        </NavLink>
        <NavLink to="/profile" className="mobile-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile</span>
        </NavLink>
      </div>
    </>
  );
}
