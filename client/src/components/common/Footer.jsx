import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-trust">
          <div className="footer-trust-item">Secure checkout</div>
          <div className="footer-trust-item">30-day returns</div>
          <div className="footer-trust-item">Fast delivery</div>
        </div>

        <div className="footer-grid">
          <div>
            <div className="footer-brand">Aura<span>.</span></div>
            <p className="footer-desc">Curated physical goods, thoughtfully made. We believe in quality over quantity - every product tells a story.</p>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
          <div>
            <div className="footer-heading">Shop</div>
            <ul className="footer-links">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=new">New Arrivals</Link></li>
              <li><Link to="/products?category=sale">Sale</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Account</div>
            <ul className="footer-links">
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Info</div>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Newsletter</div>
            <p className="footer-desc">Get early access to new drops and special pricing.</p>
            <div className="footer-newsletter">
              <input type="email" placeholder="Enter your email" />
              <button className="btn btn-primary btn-sm">Join</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Aura. All rights reserved.</span>
          <span>Built with MERN Stack</span>
        </div>
      </div>
    </footer>
  );
}
