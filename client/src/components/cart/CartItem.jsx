import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Trash2, Plus, Minus } from 'lucide-react';
import { removeFromCart, updateQty } from '../../redux/cartSlice';
import { getCategoryName } from '../../utils/product';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const itemKey = item.cartKey || item._id;
  const itemQty = item.qty ?? item.quantity ?? 1;

  return (
    <div className="card p-4 flex gap-4 items-center">
      {/* Image */}
      <Link to={`/products/${item._id}`} className="shrink-0">
        <img
          src={item.images?.[0]?.url || 'https://via.placeholder.com/80'}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item._id}`}
          className="text-sm font-semibold hover:text-[var(--accent)] transition-colors line-clamp-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {item.name}
        </Link>
        <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>{getCategoryName(item)}</p>
        {(item.selectedSize || item.selectedColor) && (
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            {item.selectedSize ? `Size: ${item.selectedSize}` : ''}{item.selectedSize && item.selectedColor ? ' · ' : ''}{item.selectedColor ? `Color: ${item.selectedColor}` : ''}
          </p>
        )}
        <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          ₹{(item.price * itemQty).toLocaleString()}
        </p>
        {itemQty > 1 && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ₹{item.price.toLocaleString()} each
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        {/* Delete */}
        <button
          onClick={() => dispatch(removeFromCart(itemKey))}
          className="p-1.5 rounded-lg transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          style={{ color: 'var(--text-muted)' }}
        >
          <Trash2 size={14} />
        </button>

        {/* Qty controls */}
        <div className="flex items-center gap-2 border rounded-xl px-2 py-1.5" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() =>
              itemQty > 1
                ? dispatch(updateQty({ id: itemKey, qty: itemQty - 1 }))
                : dispatch(removeFromCart(itemKey))
            }
            className="transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <Minus size={13} />
          </button>
          <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {itemQty}
          </span>
          <button
            onClick={() => dispatch(updateQty({ id: itemKey, qty: itemQty + 1 }))}
            className="transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
