import express from 'express';
import { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } from '../controllers/extraControllers.js';
import { protect, adminOrEditor } from '../middleware/authMiddleware.js';
const r = express.Router();
r.post('/validate', validateCoupon);
r.route('/').post(protect, adminOrEditor, createCoupon).get(protect, adminOrEditor, getAllCoupons);
r.delete('/:id', protect, adminOrEditor, deleteCoupon);
export default r;
