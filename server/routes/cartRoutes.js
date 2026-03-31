import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const r = express.Router();

// Cart is embedded in User document for simplicity
r.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  res.json(user.cart || []);
}));

export default r;
