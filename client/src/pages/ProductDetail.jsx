import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, Heart, Star, Truck, ShieldCheck,
  RotateCcw, ChevronRight, Plus, Minus, Package
} from 'lucide-react';
import { fetchProductById, clearProduct } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import { toggleWishlistAsync, isInWishlist } from '../redux/wishlistSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { getCategoryName } from '../utils/product';
import ProductCard from '../components/product/ProductCard';

function ReviewCard({ review }) {
  const reviewerName = review.user?.name || 'Guest';
  const reviewerInitial = reviewerName ? reviewerName.charAt(0).toUpperCase() : '?';

  return (
    <div className="card review-card">
      <div className="review-card-top">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: 'var(--accent)' }}>
            {reviewerInitial}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{reviewerName}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12}
              fill={i < review.rating ? 'var(--accent)' : 'none'}
              stroke={i < review.rating ? 'var(--accent)' : 'var(--text-muted)'}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{review.title}</p>
      )}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
    </div>
  );
}

function ReviewForm({ productId, onReviewAdded }) {
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setLoading(true);
    try {
      await api.post(`/reviews/${productId}`, form);
      toast.success('Review submitted!');
      setForm({ rating: 5, title: '', comment: '' });
      onReviewAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="card p-5 text-center">
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Login to write a review</p>
      <Link to="/login" className="btn-primary px-6 py-2">Login</Link>
    </div>
  );

  return (
    <div className="card review-form-card">
      <h3 className="review-form-title" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
        Write a Review
      </h3>
      <form onSubmit={handleSubmit} className="review-form-fields">
        {/* Star Rating Picker */}
        <div>
          <label className="review-form-label" style={{ color: 'var(--text-secondary)' }}>Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })} className="review-star-btn">
                <Star size={24}
                  fill={star <= form.rating ? 'var(--accent)' : 'none'}
                  stroke={star <= form.rating ? 'var(--accent)' : 'var(--text-muted)'}
                  className="transition-transform hover:scale-110"
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="review-form-label" style={{ color: 'var(--text-secondary)' }}>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Summary of your review" className="input-field" />
        </div>
        <div>
          <label className="review-form-label" style={{ color: 'var(--text-secondary)' }}>Comment</label>
          <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
            required rows={4} placeholder="Share your experience..." className="input-field review-form-textarea" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary review-submit-btn disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const wishlisted = useSelector(isInWishlist(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState('');
  const [colorVariants, setColorVariants] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedSize('');
    dispatch(fetchProductById(id));
    fetchReviews();
    return () => dispatch(clearProduct());
  }, [id, dispatch]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data);
    } catch {}
  };

  const fetchRecommended = async (category) => {
    try {
      const { data } = await api.get('/products', { params: { category, limit: 8 } });
      const items = (data.products || []).filter((p) => p._id !== id);
      setRecommended(items.slice(0, 4));
    } catch {}
  };

  const fetchColorVariants = async (group) => {
    try {
      const { data } = await api.get('/products', { params: { variantGroup: group, limit: 50 } });
      const variants = (data.products || [])
        .filter((p) => p?.colorName)
        .sort((a, b) => (a.colorName || '').localeCompare(b.colorName || ''));
      setColorVariants(variants);
    } catch {
      setColorVariants([]);
    }
  };

  const updateRecentlyViewed = (item) => {
    try {
      const now = Date.now();
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const valid = stored.filter((p) => p?._id && p?.viewedAt && (now - p.viewedAt) <= THIRTY_DAYS_MS);
      const filtered = valid.filter((p) => p._id !== item._id);
      const itemWithTimestamp = { ...item, viewedAt: now };
      const next = [itemWithTimestamp, ...filtered]
        .sort((a, b) => (b.viewedAt || 0) - (a.viewedAt || 0))
        .slice(0, 12);
      localStorage.setItem('recentlyViewed', JSON.stringify(next));
      setRecentlyViewed(next.filter((p) => p._id !== item._id).slice(0, 4));
    } catch {}
  };

  const handleAddToCart = () => {
    if (sizes.length && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    dispatch(addToCart({ ...product, quantity, selectedSize, selectedColor: product?.colorName || '' }));
    toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart!`);
  };

  const handleWishlist = () => {
    if (!user) { toast.error('Please login first'); return; }
    dispatch(toggleWishlistAsync(product));
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const discount = product?.comparePrice > product?.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;
  const categoryName = getCategoryName(product);
  const sizes = useMemo(() => {
    if (Array.isArray(product?.sizes) && product.sizes.length) return product.sizes;
    return ['UK 6 (EU 40)', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  }, [product]);
  const activeColorLabel = product?.colorName || '';
  const sizeAvailability = product?.sizeAvailability || {};
  const pairItWith = recommended.slice(0, 2);

  useEffect(() => {
    if (categoryName) fetchRecommended(categoryName);
  }, [categoryName]);

  useEffect(() => {
    if (product?._id) updateRecentlyViewed(product);
  }, [product?._id]);

  useEffect(() => {
    if (product?.variantGroup) fetchColorVariants(product.variantGroup);
    else setColorVariants([]);
  }, [product?.variantGroup]);

  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsGalleryOpen(false);
      if (e.key === 'ArrowRight') {
        setSelectedImage((i) => Math.min((product.images?.length || 1) - 1, i + 1));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedImage((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isGalleryOpen, product?.images?.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) < 40) return;
    const total = product.images?.length || 1;
    if (delta > 0 && selectedImage < total - 1) {
      setSelectedImage((i) => i + 1);
    } else if (delta < 0 && selectedImage > 0) {
      setSelectedImage((i) => i - 1);
    }
  };

  // Loading skeleton
  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          <div className="space-y-4">
            <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            <div className="h-8 rounded w-3/4" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            <div className="h-10 rounded w-1/3" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            <div className="h-12 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            <div className="h-12 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in product-detail-page">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-[var(--accent)] transition-colors">Products</Link>
        <ChevronRight size={14} />
        <Link to={`/products?category=${encodeURIComponent(categoryName)}`} className="hover:text-[var(--accent)] transition-colors">
          {categoryName}
        </Link>
        <ChevronRight size={14} />
        <span className="line-clamp-1" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </div>

      {/* Main Section */}
      <div className="product-detail-grid mb-16">

        {/* Images */}
        <div className="product-detail-gallery">
          <div className="product-detail-thumbs">
            {(product.images || []).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`product-thumb ${selectedImage === i ? 'active' : ''}`}
              >
                <img src={img.url || img} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>
          <div
            className="product-detail-hero"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsGalleryOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsGalleryOpen(true)}
          >
            <img
              src={product.images?.[selectedImage]?.url || product.images?.[selectedImage] || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-detail-info">
          {/* Category & badges */}
          <div className="product-meta-row">
            <span className="product-category-kicker" style={{ color: 'var(--accent)' }}>
              {categoryName}
            </span>
            {discount && (
              <span className="badge text-white text-xs" style={{ backgroundColor: 'var(--accent)' }}>
                -{discount}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="badge text-xs" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                Featured
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="product-title" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h1>
          <p className="product-brand" style={{ color: 'var(--text-muted)' }}>
            {product.brand || 'Men\'s Shoes'}
          </p>

          {/* Rating */}
          <div className="product-rating-row">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16}
                  fill={i < Math.round(product.ratings) ? 'var(--accent)' : 'none'}
                  stroke={i < Math.round(product.ratings) ? 'var(--accent)' : 'var(--text-muted)'}
                />
              ))}
            </div>
            <span className="product-rating-score" style={{ color: 'var(--text-primary)' }}>
              {product.ratings?.toFixed(1) || '0.0'}
            </span>
            <span className="product-rating-count" style={{ color: 'var(--text-muted)' }}>
              ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="product-stock-status">
            <span className={`dot ${product.stock > 0 ? 'ok' : 'bad'}`} />
            {product.stock > 0 ? (product.stock > 10 ? 'In stock' : `Only ${product.stock} left`) : 'Out of stock'}
          </div>

          {/* Price */}
          <div className="product-price-row">
            <span className="product-price-current" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
              ₹{product.price.toLocaleString()}
            </span>
            {product.comparePrice > product.price && (
              <span className="product-price-compare" style={{ color: 'var(--text-muted)' }}>
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
            {discount && (
              <span className="product-price-save" style={{ color: 'var(--accent)' }}>
                Save ₹{(product.comparePrice - product.price).toLocaleString()}
              </span>
            )}
          </div>
          <p className="product-tax-note" style={{ color: 'var(--text-muted)' }}>Inclusive of all taxes</p>

          {/* Size selector */}
          {colorVariants.length > 0 && (
            <div className="product-color-block">
              <div className="product-size-header">
                <h3>Select Color</h3>
                <span className="product-color-count">{colorVariants.length} option{colorVariants.length > 1 ? 's' : ''}</span>
              </div>
              <div className="product-color-grid">
                {colorVariants.map((variant) => (
                  <button
                    key={variant._id}
                    type="button"
                    onClick={() => {
                      if (variant._id !== product._id) navigate(`/products/${variant._id}`);
                    }}
                    className={`product-color-btn product-color-variant ${variant._id === product._id ? 'active' : ''}`}
                    title={variant.colorName}
                  >
                    {variant.colorHex && <span className="product-color-dot" style={{ backgroundColor: variant.colorHex }} />}
                    <span>{variant.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          <div className="product-size-block">
            <div className="product-size-header">
              <h3>Select Size</h3>
              <button className="product-size-guide" onClick={() => setShowSizeGuide(true)}>Size Guide</button>
            </div>
            <p className="product-fit-note">Fit: true to size. If between sizes, size up.</p>
            {product.stock === 0 && (
              <p className="product-stock-note">Out of stock for this product</p>
            )}
            <div className="product-size-grid">
              {sizes.map((size) => (
                (() => {
                  const available = sizeAvailability[size] === undefined ? product.stock > 0 : sizeAvailability[size] > 0;
                  return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!available}
                  className={`product-size-btn ${selectedSize === size ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                >
                  {size}
                </button>
                  );
                })()
              ))}
            </div>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="product-qty-row">
              <span className="product-qty-label">Quantity</span>
              <div className="product-qty-control">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="product-qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="product-qty-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="product-qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="product-qty-available">{product.stock} available</span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="product-cta-row">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary product-add-btn disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className="product-wishlist-btn"
              style={{ color: wishlisted ? 'var(--accent)' : 'var(--text-muted)' }}
              aria-label="Toggle wishlist"
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="secure-badge">
            <ShieldCheck size={14} />
            Secure checkout
          </div>

          {/* Mobile sticky CTA */}
          <div className="product-mobile-cta">
            <div>
              <div className="product-mobile-price">₹{product.price.toLocaleString()}</div>
              <div className="product-mobile-sub">
                Size {selectedSize || 'Select'}{(colorVariants.length > 0 || activeColorLabel) ? ` · Color ${activeColorLabel || 'Select'}` : ''}
              </div>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary">
              Add to Cart
            </button>
          </div>

          {/* Delivery info */}
          <div className="product-benefits" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {[
              { icon: Truck, text: 'Free delivery on orders above Rs. 999' },
              { icon: ShieldCheck, text: '100% secure & safe payments' },
              { icon: RotateCcw, text: 'Easy 30-day returns & exchanges' },
              { icon: Package, text: '1-year limited warranty included' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="product-benefit-item">
                <Icon size={15} style={{ color: 'var(--accent)' }} className="shrink-0" />
                <span className="product-benefit-text" style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>

          <div className="trust-strip">
            <div className="trust-card">
              <div className="trust-title">Why shop with us</div>
              <ul>
                <li>30-day easy returns</li>
                <li>Fast, tracked delivery</li>
                <li>Authenticity guaranteed</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-title">Verified reviews</div>
              <p>{product.ratings?.toFixed(1) || '0.0'} out of 5</p>
              <span>{product.numReviews || 0} verified ratings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* Tabs */}
      <div className="product-tabs-wrap">
        <div className="product-tab-list">
          {['description', 'reviews'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`product-tab-btn ${activeTab === tab ? 'active' : ''}`}>
              {tab} {tab === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="animate-fade-in">
            <div className="prose max-w-none">
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {product.description}
              </p>
            </div>
            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="card p-5 mb-6 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
                    {product.ratings?.toFixed(1)}
                  </p>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14}
                        fill={i < Math.round(product.ratings) ? 'var(--accent)' : 'none'}
                        stroke={i < Math.round(product.ratings) ? 'var(--accent)' : 'var(--text-muted)'}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{reviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3" style={{ color: 'var(--text-muted)' }}>{star}</span>
                        <Star size={10} fill="var(--accent)" stroke="var(--accent)" />
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
                        </div>
                        <span className="text-xs w-4 text-right" style={{ color: 'var(--text-muted)' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Review Form */}
              <ReviewForm productId={id} onReviewAdded={fetchReviews} />

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="card review-empty-card">
                    <Star size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-primary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map((review) => <ReviewCard key={review._id} review={review} />)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {(recommended.length > 0 || recentlyViewed.length > 0) && <div className="section-divider" />}

      {pairItWith.length > 0 && (
        <section className="mt-10">
          <div className="product-section-head">
            <h2 className="product-section-title">Pair it with</h2>
            <Link to="/products" className="product-section-link">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pairItWith.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="mt-12">
          <div className="product-section-head">
            <div>
              <h2 className="product-section-title">Recommended for you</h2>
              <p className="product-section-subtitle">
                Curated picks based on your current selection.
              </p>
            </div>
            <Link to="/products" className="product-section-link">Browse more</Link>
          </div>
          <div className="product-carousel">
            {recommended.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="mt-12">
          <div className="product-section-head">
            <h2 className="product-section-title">Recently viewed</h2>
            <Link to="/products" className="product-section-link">Continue shopping</Link>
          </div>
          <div className="product-carousel">
            {recentlyViewed.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {isGalleryOpen && (
        <div className="product-gallery-modal" onClick={() => setIsGalleryOpen(false)}>
          <div className="product-gallery-content" onClick={(e) => e.stopPropagation()}>
            <div className="product-gallery-toolbar">
              <span className="product-gallery-count">
                {selectedImage + 1} / {product.images?.length || 1}
              </span>
              <button className="product-gallery-close" onClick={() => setIsGalleryOpen(false)} aria-label="Close gallery">
                ×
              </button>
            </div>
            <button
              className="product-gallery-nav left"
              onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
              disabled={selectedImage === 0}
              aria-label="Previous image"
            >
              ‹
            </button>
            <img
              src={product.images?.[selectedImage]?.url || product.images?.[selectedImage] || 'https://via.placeholder.com/800x600?text=No+Image'}
              alt={`${product.name} view`}
            />
            <button
              className="product-gallery-nav right"
              onClick={() => setSelectedImage((i) => Math.min((product.images?.length || 1) - 1, i + 1))}
              disabled={selectedImage === (product.images?.length || 1) - 1}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="product-gallery-thumbs">
              {(product.images || []).map((img, i) => (
                <button
                  key={i}
                  className={`product-gallery-thumb ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img.url || img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSizeGuide && (
        <div className="product-modal" onClick={() => setShowSizeGuide(false)}>
          <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Size Guide</h3>
              <button className="text-sm" onClick={() => setShowSizeGuide(false)} style={{ color: 'var(--text-muted)' }}>Close</button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Use this guide to find your best fit. Measurements are approximate.
            </p>
            <div className="product-size-table">
              <div className="product-size-row header">
                <span>UK</span>
                <span>EU</span>
                <span>CM</span>
              </div>
              {[
                { uk: '6', eu: '40', cm: '25' },
                { uk: '7', eu: '41', cm: '26' },
                { uk: '8', eu: '42', cm: '27' },
                { uk: '9', eu: '43', cm: '28' },
                { uk: '10', eu: '44', cm: '29' },
                { uk: '11', eu: '45', cm: '30' },
              ].map((row) => (
                <div key={row.uk} className="product-size-row">
                  <span>{row.uk}</span>
                  <span>{row.eu}</span>
                  <span>{row.cm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
