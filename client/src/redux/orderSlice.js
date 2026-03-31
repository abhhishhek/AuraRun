import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/orders";

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const placeOrder = createAsyncThunk("orders/place", async (orderData, { rejectWithValue }) => {
  try {
    const res = await axios.post(API, orderData, getConfig());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data.message);
  }
});

export const fetchMyOrders = createAsyncThunk("orders/myOrders", async () => {
  const res = await axios.get(`${API}/my`, getConfig());
  return res.data;
});

export const fetchOrderById = createAsyncThunk("orders/getOne", async (id) => {
  const res = await axios.get(`${API}/${id}`, getConfig());
  return res.data;
});

const orderSlice = createSlice({
  name: "orders",
  initialState: { list: [], order: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.order = action.payload; })
      .addCase(placeOrder.pending, (state) => { state.loading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => { state.loading = false; state.order = action.payload; })
      .addCase(placeOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default orderSlice.reducer;
