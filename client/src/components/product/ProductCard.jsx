import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../../redux/cartSlice';
import { toggleWishlistAsync, isInWishlist } from '../../redux/wishlistSlice';
import toast from 'react-hot-toast';
import { getCategoryName } from '../../utils/product';
import api from '../../utils/api';

const prefetched = new Set();

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlisted = useSelector(isInWishlist(product._id));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [wishPop, setWishPop] = useState(false);

  const sizes = useMemo(() => {
    if (Array.isArray(product?.sizes) && product.sizes.length) return product.sizes;
    return [];
  }, [product]);
  const socialCount = useMemo(() => {
    const base = `${product._id || ''}${product.name || ''}`;
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) sum += base.charCodeAt(i);
    return (sum % 30) + 5;
  }, [product._id, product.name]);
  const socialLabel = socialCount > 22 ? 'Trending now' : `${socialCount} added today`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (sizes.length) {
      setShowSizePicker(true);
      return;
    }
    dispatch(addToCart({ ...product, selectedColor: product.colorName || '' }));
    toast.success('Added to cart!');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    dispatch(toggleWishlistAsync(product));
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    setWishPop(true);
    setTimeout(() => setWishPop(false), 300);
  };

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;
  const tags = (product.tags || []).filter((t) => ['New Arrival', 'Bestseller', 'Trending'].includes(t));

  return (
    <Link
      to={`/products/${product._id}`}
      className="product-card group"
      onMouseEnter={() => {
        if (prefetched.has(product._id)) return;
        prefetched.add(product._id);
        api.get(`/products/${product._id}`).catch(() => {});
      }}
    >
      <div className="product-card-image">
        <img
          src={product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`product-card-img ${imageLoaded ? 'loaded' : ''}`}
        />

        <div className="product-card-badges">
          {discount && (
            <span className="badge badge-sale">
              -{discount}%
            </span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            onClick={handleWishlist}
            className={`product-action-btn ${wishlisted ? 'active' : ''} ${wishPop ? 'pop' : ''}`}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="product-social-proof">
          {socialLabel}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white font-medium text-xs tracking-wide">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-category">{getCategoryName(product)}</div>
        {tags.length > 0 && (
          <div className="product-tag-row">
            {tags.map((tag) => (
              <span key={tag} className="product-tag">{tag}</span>
            ))}
          </div>
        )}
        <div className="product-name">{product.name}</div>

        {product.numReviews > 0 && (
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="rating-count">({product.numReviews})</span>
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">₹{product.price.toLocaleString()}</span>
            {product.comparePrice > product.price && (
              <span className="price-original">₹{product.comparePrice.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="add-to-cart-btn"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>

      {showSizePicker && (
        <div
          className="product-card-modal"
          onClick={(e) => { e.preventDefault(); setShowSizePicker(false); }}
        >
          <div
            className="product-card-modal-content"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="product-card-modal-header">
              <div>
                <div className="product-card-modal-title">Select size</div>
                <div className="product-card-modal-sub">{product.name}</div>
              </div>
              <button className="product-card-modal-close" onClick={() => setShowSizePicker(false)}>Close</button>
            </div>
            <div className="product-card-size-grid">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`product-size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => { setSelectedSize(size); setSizeError(''); }}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && <div className="form-error">{sizeError}</div>}
            <div className="product-card-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowSizePicker(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!selectedSize) { setSizeError('Please select a size'); return; }
                  dispatch(addToCart({ ...product, selectedSize, selectedColor: product.colorName || '' }));
                  toast.success('Added to cart!');
                  setShowSizePicker(false);
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

    </Link>
  );
}
