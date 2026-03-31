import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("cart")) || [];
    return parsed.map((item) => ({
      ...item,
      qty: item.qty ?? item.quantity ?? 1,
      cartKey: item.cartKey || `${item._id}::${item.selectedSize || ''}::${item.selectedColor || ''}`,
    }));
  }
  catch { return []; }
};

const saveCart = (items) => localStorage.setItem("cart", JSON.stringify(items));
const buildCartKey = (item) => `${item._id}::${item.selectedSize || ''}::${item.selectedColor || ''}`;

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: loadCart() },
  reducers: {
    addToCart: (state, action) => {
      const cartKey = buildCartKey(action.payload);
      const existing = state.items.find((i) => (i.cartKey || buildCartKey(i)) === cartKey);
      const incomingQty = Math.max(1, Number(action.payload.quantity) || 1);
      if (existing) {
        existing.qty = Math.min(existing.qty + incomingQty, existing.stock);
      } else {
        state.items.push({ ...action.payload, cartKey, qty: Math.min(incomingQty, action.payload.stock) });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      const key = typeof action.payload === 'string' ? action.payload : action.payload?.cartKey;
      state.items = state.items.filter((i) => (i.cartKey || i._id) !== key);
      saveCart(state.items);
    },
    updateQty: (state, action) => {
      const item = state.items.find((i) => (i.cartKey || i._id) === action.payload.id);
      if (item) item.qty = action.payload.qty;
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export default cartSlice.reducer;
