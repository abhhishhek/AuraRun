import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const FALLBACK_PRODUCTS = [
  {
    _id: 'shoe-pegasus-41',
    name: 'Nike Pegasus 41 Road Running Shoes',
    category: 'Running',
    price: 9995,
    comparePrice: 11995,
    stock: 24,
    ratings: 4.6,
    numReviews: 128,
    description: 'Responsive cushioning and breathable mesh upper built for everyday miles.',
    images: [{ url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200' }],
  },
  {
    _id: 'shoe-metcon-9',
    name: 'Nike Metcon 9 Training Shoes',
    category: 'Training & Gym',
    price: 11995,
    comparePrice: 12995,
    stock: 18,
    ratings: 4.5,
    numReviews: 89,
    description: 'Stable base and grippy outsole for heavy lifts and HIIT days.',
    images: [{ url: 'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200' }],
  },
  {
    _id: 'shoe-dunk-low',
    name: 'Nike Dunk Low Retro',
    category: 'Lifestyle',
    price: 8995,
    comparePrice: 9995,
    stock: 20,
    ratings: 4.7,
    numReviews: 203,
    description: 'Classic hoops-inspired style with everyday comfort.',
    images: [{ url: 'https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&w=1200' }],
  },
  {
    _id: 'shoe-lebron-xxi',
    name: 'Nike LeBron XXI',
    category: 'Basketball',
    price: 16995,
    comparePrice: 17995,
    stock: 9,
    ratings: 4.8,
    numReviews: 54,
    description: 'Supportive fit and Zoom Air cushioning built for explosive takeoffs.',
    images: [{ url: 'https://images.pexels.com/photos/2529145/pexels-photo-2529145.jpeg?auto=compress&cs=tinysrgb&w=1200' }],
  },
];

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    if (!err.response) {
      return {
        products: FALLBACK_PRODUCTS,
        page: 1,
        pages: 1,
        total: FALLBACK_PRODUCTS.length,
      };
    }
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    if (!err.response) {
      const found = FALLBACK_PRODUCTS.find((p) => p._id === id);
      if (found) return found;
    }
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],       // always an array, never undefined
    product: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
    total: 0,
    filters: {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    },
  },
  reducers: {
    clearProduct(state) { state.product = null; },
    clearError(state) { state.error = null; },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchProducts.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload.products ?? [];   // safe fallback
      s.page = a.payload.page ?? 1;
      s.pages = a.payload.pages ?? 1;
      s.total = a.payload.total ?? 0;
    });
    b.addCase(fetchProducts.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload;
      s.items = [];   // reset to empty array on error
    });
    b.addCase(fetchProductById.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.product = a.payload; });
    b.addCase(fetchProductById.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearProduct, clearError, setFilters } = productSlice.actions;
export default productSlice.reducer;
