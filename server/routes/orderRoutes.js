// orderRoutes.js
import express from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOrEditor } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').post(protect, createOrder).get(protect, adminOrEditor, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOrEditor, updateOrderStatus);

export default router;
