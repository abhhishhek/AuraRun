import express from 'express';
import { getProductReviews, createReview, deleteReview } from '../controllers/extraControllers.js';
import { protect } from '../middleware/authMiddleware.js';
const r = express.Router();
r.get('/:productId', getProductReviews);
r.post('/:productId', protect, createReview);
r.delete('/:id', protect, deleteReview);
export default r;
