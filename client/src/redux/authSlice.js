import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const loadUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const verifySignupOtp = createAsyncThunk('auth/verifySignupOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-signup-otp', payload);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const updateProfile = createAsyncThunk('auth/update', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUser(),
    loading: false,
    error: null,
    pendingSignupEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder.addCase(loginUser.pending, pending);
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(loginUser.rejected, rejected);

    builder.addCase(registerUser.pending, pending);
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.pendingSignupEmail = action.payload?.email || null;
    });
    builder.addCase(registerUser.rejected, rejected);

    builder.addCase(verifySignupOtp.pending, pending);
    builder.addCase(verifySignupOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.pendingSignupEmail = null;
    });
    builder.addCase(verifySignupOtp.rejected, rejected);

    builder.addCase(updateProfile.pending, pending);
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(updateProfile.rejected, rejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
