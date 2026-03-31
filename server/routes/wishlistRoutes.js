// wishlistRoutes.js
import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/extraControllers.js';
import { protect } from '../middleware/authMiddleware.js';
const r = express.Router();
r.get('/', protect, getWishlist);
r.post('/:productId', protect, toggleWishlist);
export default r;
