import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function EmptyCart() {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <ShoppingBag size={40} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h2 className="text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h2>
      <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
        Looks like you haven't added anything to your cart yet. Start exploring our products!
      </p>
      <Link to="/products" className="btn-primary px-8 py-3.5">
        Browse Products
      </Link>
    </div>
  );
}
