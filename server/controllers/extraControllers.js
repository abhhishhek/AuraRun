import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import Announcement from '../models/Announcement.js';

// ── WISHLIST ─────────────────────────────────────────────
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.indexOf(pid);
  if (idx === -1) user.wishlist.push(pid);
  else user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

// ── REVIEWS ──────────────────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });
  if (existing) { res.status(400); throw new Error('Already reviewed'); }

  const review = await Review.create({
    user: req.user._id,
    product: req.params.productId,
    rating,
    title,
    comment,
  });

  // Update product ratings
  const reviews = await Review.find({ product: req.params.productId });
  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(req.params.productId, { ratings: avg, numReviews: reviews.length });

  res.status(201).json(review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await review.deleteOne();
  res.json({ message: 'Review removed' });
});

// ── COUPONS ──────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (new Date(coupon.expiryDate) < new Date()) { res.status(400); throw new Error('Coupon expired'); }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
  if (orderAmount < coupon.minOrderAmount) { res.status(400); throw new Error(`Min order ₹${coupon.minOrderAmount} required`); }

  const discount = coupon.discountType === 'percent'
    ? Math.min((orderAmount * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
    : coupon.discountValue;

  res.json({ valid: true, discount, coupon });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});

// â”€â”€ SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAnnouncement = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: 'announcement' });
  res.json({ value: setting?.value || '' });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { value } = req.body;
  const updated = await Setting.findOneAndUpdate(
    { key: 'announcement' },
    { value: value || '' },
    { upsert: true, new: true }
  );
  res.json({ value: updated.value });
});

// ——— ANNOUNCEMENTS ——————————————————————————————
export const getAnnouncements = asyncHandler(async (req, res) => {
  const list = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(list);
});

export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const list = await Announcement.find().sort({ createdAt: -1 });
  res.json(list);
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { message, isActive = true } = req.body;
  if (!message?.trim()) { res.status(400); throw new Error('Message is required'); }
  const item = await Announcement.create({ message: message.trim(), isActive });
  res.status(201).json(item);
});

export const updateAnnouncementItem = asyncHandler(async (req, res) => {
  const { message, isActive } = req.body;
  const item = await Announcement.findById(req.params.id);
  if (!item) { res.status(404); throw new Error('Announcement not found'); }
  if (message !== undefined) item.message = message.trim();
  if (isActive !== undefined) item.isActive = isActive;
  const updated = await item.save();
  res.json(updated);
});

export const deleteAnnouncementItem = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Announcement deleted' });
});
