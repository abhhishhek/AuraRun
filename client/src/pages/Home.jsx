import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { fetchProducts } from '../redux/productSlice';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';
import { getCategoryName } from '../utils/product';

const FEATURES = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Express shipping on select drops' },
  { icon: ShieldCheck, title: 'Authentic Gear', desc: 'Quality checked and verified' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: Headphones, title: 'Member Support', desc: 'Priority help for members' },
];

const DEFAULT_CATEGORIES = ['Running', 'Training & Gym', 'Lifestyle', 'Basketball', 'Football', 'Kids'];

export default function Home() {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((s) => s.products);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 200, sort: 'newest' }));
  }, [dispatch]);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) {
          setCategories(data.map((c) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(stored.slice(0, 10));
    } catch {}
  }, []);

  const hasTag = (product, tag) =>
    (product?.tags || []).some((t) => t?.toLowerCase?.() === tag.toLowerCase());
  const newArrivals = useMemo(
    () => items.filter((p) => hasTag(p, 'New Arrival')).slice(0, 8),
    [items]
  );
  const bestSellers = useMemo(
    () => items.filter((p) => hasTag(p, 'Bestseller')).slice(0, 8),
    [items]
  );
  const trending = useMemo(
    () => items.filter((p) => hasTag(p, 'Trending')).slice(0, 8),
    [items]
  );
  const featured = newArrivals[0] || items[0];
  const rest = newArrivals;

  return (
    <div className="home-page">
      {/* Nike-style hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-left">
            <span className="home-hero-tagline">New Season. New You.</span>
            <h1 className="home-hero-title">
              Elevate your<br />
              <span>everyday game.</span>
            </h1>
            <p className="home-hero-subtitle">
              Lightweight, responsive, and built for motion. Discover gear that keeps up with every move you make.
            </p>
            <div className="home-hero-cta">
              <Link to="/products" className="home-hero-primary">
                Shop latest drops <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=popular" className="home-hero-secondary">
                View bestsellers
              </Link>
            </div>
            <div className="home-hero-meta">
              <div>
                <div className="home-hero-meta-value">Rs. 0</div>
                <div className="home-hero-meta-label">Delivery on member orders</div>
              </div>
              <div>
                <div className="home-hero-meta-value">7K+</div>
                <div className="home-hero-meta-label">Verified reviews</div>
              </div>
              <div>
                <div className="home-hero-meta-value">24/7</div>
                <div className="home-hero-meta-label">Support for every order</div>
              </div>
            </div>
          </div>

          <div className="home-hero-right">
            <div className="home-hero-card">
              <div className="home-hero-gradient" />
              <div className="home-hero-product">
                <div className="home-hero-pill">Featured drop</div>
                <h2 className="home-hero-product-title">
                  {featured?.name || 'Your next favorite pair'}
                </h2>
                <p className="home-hero-product-text">
                  Cushioning, grip and support tuned for all‑day comfort.
                </p>
                <div className="home-hero-product-footer">
                  <div>
                    <div className="home-hero-price">
                      {featured ? `Rs. ${featured.price.toLocaleString()}` : 'From Rs. 2,999'}
                    </div>
                    {getCategoryName(featured) && (
                      <div className="home-hero-chip">{getCategoryName(featured)}</div>
                    )}
                  </div>
                  {featured && (
                    <Link to={`/products/${featured._id}`} className="home-hero-circle-btn">
                      <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>
              <div className="home-hero-image-wrap">
                <img
                  src={featured?.images?.[0]?.url || 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                  alt={featured?.name || 'Featured product'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strip of features */}
      <section className="home-strip">
        <div className="home-strip-inner">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="home-strip-item">
              <div className="home-strip-icon">
                <Icon size={18} />
              </div>
              <div>
                <p className="home-strip-title">{title}</p>
                <p className="home-strip-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Category pills */}
      <section className="home-section section-tint">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Shop by sport & style</h2>
            <p className="home-section-subtitle">
              Tap into collections built to move with you.
            </p>
          </div>
          <Link to="/products" className="home-link">
            Explore all gear <ArrowRight size={14} />
          </Link>
        </div>
        <div className="home-category-row">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="home-category-pill"
            >
              <span>{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Product rail (new arrivals) */}
      <section className="home-section home-products">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">New for you</h2>
            <p className="home-section-subtitle">
              Fresh drops, refreshed weekly.
            </p>
          </div>
          <Link to="/products" className="home-link">
            Shop all products <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="home-products-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card home-skeleton-card">
                <div className="home-skeleton-image" />
                <div className="home-skeleton-body">
                  <div className="home-skeleton-line" />
                  <div className="home-skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : rest.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty-emoji">🛍️</p>
            <h3>No new arrivals yet</h3>
            <p>Mark products as <strong>New Arrival</strong> from admin to show them here.</p>
          </div>
        ) : (
          <div className="home-products-grid">
            {rest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="home-section home-products">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Best Sellers</h2>
            <p className="home-section-subtitle">
              Most loved by the Aura community.
            </p>
          </div>
          <Link to="/products?sort=rating" className="home-link">
            View top rated <ArrowRight size={14} />
          </Link>
        </div>
        {bestSellers.length === 0 ? (
          <div className="home-empty">
            <h3>No bestsellers yet</h3>
            <p>Mark products as <strong>Bestseller</strong> from admin to show them here.</p>
          </div>
        ) : (
          <div className="product-carousel">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="home-section home-products">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Trending Now</h2>
            <p className="home-section-subtitle">
              The pairs everyone is talking about.
            </p>
          </div>
          <Link to="/products?sort=popular" className="home-link">
            Explore trending <ArrowRight size={14} />
          </Link>
        </div>
        {trending.length === 0 ? (
          <div className="home-empty">
            <h3>No trending products yet</h3>
            <p>Mark products as <strong>Trending</strong> from admin to show them here.</p>
          </div>
        ) : (
          <div className="product-carousel">
            {trending.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand story */}
      <section className="home-section home-story">
        <div className="home-story-inner">
          <div className="home-story-copy">
            <p className="home-story-kicker">Brand Story</p>
            <h2>Built for motion, crafted for comfort.</h2>
            <p>
              AuraRun started with a simple mission: create footwear that feels
              effortless on long days and still looks sharp on the street.
              Every drop is tested by runners, refined by designers, and tuned
              with premium cushioning.
            </p>
            <p>
              We work with trusted factories, low-impact packaging, and a
              community that pushes us to build better gear every season.
            </p>
            <Link to="/about" className="btn-primary px-6 py-3">Read our story</Link>
          </div>
          <div className="home-story-media">
            <img
              src="https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="AuraRun story"
            />
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">Recently viewed</h2>
              <p className="home-section-subtitle">
                Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="product-carousel">
            {recentlyViewed.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="home-bottom-cta">
        <div className="home-bottom-inner">
          <div>
            <p className="home-bottom-kicker">Aura Members</p>
            <h2>Early access to upcoming drops.</h2>
            <p>Join for free and be the first to know when new collections land.</p>
          </div>
          <div className="home-bottom-actions">
            <Link to="/register" className="home-hero-primary">
              Join now
            </Link>
            <Link to="/login" className="home-hero-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
