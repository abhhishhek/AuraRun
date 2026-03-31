import express from 'express';
import multer from 'multer';
import {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, getCategories, uploadProductImages, bulkUpdateProducts, bulkUpdateProductsFromCsv
} from '../controllers/productController.js';
import { protect, adminOrEditor } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
const csvUpload = multer({ storage: multer.memoryStorage() });
const handleProductUpload = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(err.message || 'Image upload failed'));
    }
    return next();
  });
};

router.route('/').get(getProducts).post(protect, adminOrEditor, createProduct);
router.put('/bulk-update', protect, adminOrEditor, bulkUpdateProducts);
router.post('/bulk-update-csv', protect, adminOrEditor, csvUpload.single('file'), bulkUpdateProductsFromCsv);
router.get('/categories', getCategories);
router.post('/upload', protect, adminOrEditor, handleProductUpload, uploadProductImages);
router.route('/:id').get(getProductById).put(protect, adminOrEditor, updateProduct).delete(protect, adminOrEditor, deleteProduct);

export default router;
