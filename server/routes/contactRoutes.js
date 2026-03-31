import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { protect, adminOrEditor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createContactMessage).get(protect, adminOrEditor, getContactMessages);
router.route('/:id').put(protect, adminOrEditor, updateContactMessageStatus).delete(protect, adminOrEditor, deleteContactMessage);

export default router;
