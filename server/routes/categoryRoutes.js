import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOrEditor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, adminOrEditor, createCategory);
router.route('/:id').put(protect, adminOrEditor, updateCategory).delete(protect, adminOrEditor, deleteCategory);

export default router;
