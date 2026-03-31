import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

const loadWishlist = () => {
  try { return JSON.parse(localStorage.getItem("wishlist")) || []; }
  catch { return []; }
};

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.user) return loadWishlist();
  try {
    const { data } = await api.get("/wishlist");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch wishlist");
  }
});

export const toggleWishlistAsync = createAsyncThunk("wishlist/toggle", async (product, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.user) return { local: true, product };
  try {
    await api.post(`/wishlist/${product._id}`);
    const { data } = await api.get("/wishlist");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update wishlist");
  }
});

export const removeWishlistItem = createAsyncThunk("wishlist/remove", async (productId, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.user) return { localRemove: true, productId };
  try {
    await api.post(`/wishlist/${productId}`);
    const { data } = await api.get("/wishlist");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update wishlist");
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: loadWishlist(), error: null },
  reducers: {
    setWishlist(state, action) {
      state.items = action.payload || [];
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
    toggleWishlistLocal: (state, action) => {
      const exists = state.items.find((i) => i._id === action.payload._id);
      if (exists) {
        state.items = state.items.filter((i) => i._id !== action.payload._id);
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
    removeFromWishlistLocal: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    });
    builder.addCase(toggleWishlistAsync.fulfilled, (state, action) => {
      if (action.payload?.local) {
        const exists = state.items.find((i) => i._id === action.payload.product._id);
        if (exists) state.items = state.items.filter((i) => i._id !== action.payload.product._id);
        else state.items.push(action.payload.product);
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      } else if (Array.isArray(action.payload)) {
        state.items = action.payload;
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    });
    builder.addCase(removeWishlistItem.fulfilled, (state, action) => {
      if (action.payload?.localRemove) {
        state.items = state.items.filter((i) => i._id !== action.payload.productId);
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      } else if (Array.isArray(action.payload)) {
        state.items = action.payload;
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    });
  },
});

export const { setWishlist, toggleWishlistLocal, removeFromWishlistLocal } = wishlistSlice.actions;
export const isInWishlist = (id) => (state) => state.wishlist.items.some((i) => i._id === id);
export default wishlistSlice.reducer;
