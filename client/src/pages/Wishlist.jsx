import { useDispatch, useSelector } from 'react-redux';
import { HeartOff, ShoppingCart } from 'lucide-react';
import { fetchWishlist, removeWishlistItem } from '../redux/wishlistSlice';
import ProductCard from '../components/product/ProductCard';
import { Link } from 'react-router-dom';
import { addToCart } from '../redux/cartSlice';
import { useEffect } from 'react';

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.wishlist.items);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [user, dispatch]);

  if (!items.length) {
    return (
      <div className="wishlist-empty">
        <div className="empty-illustration">Empty</div>
        <h2>Your wishlist is empty</h2>
        <p>Save your favorite drops here so you never miss a restock.</p>
        <Link to="/products" className="btn-primary px-6 py-3">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <p className="wishlist-kicker">Wishlist</p>
          <h1>Saved Picks</h1>
        </div>
        <span>{items.length} items</span>
      </div>

      <div className="wishlist-grid">
        {items.map((item) => (
          <div key={item._id} className="wishlist-card">
            <ProductCard product={item} />
            <div className="wishlist-actions">
              <button
                className="wishlist-move"
                onClick={() => {
                  dispatch(addToCart(item));
                  dispatch(removeWishlistItem(item._id));
                }}
              >
                <ShoppingCart size={16} />
                Move to cart
              </button>
              <button
                className="wishlist-remove"
                onClick={() => dispatch(removeWishlistItem(item._id))}
              >
                <HeartOff size={16} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
