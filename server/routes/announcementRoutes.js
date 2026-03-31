import express from 'express';
import { getAnnouncements, getAllAnnouncements, createAnnouncement, updateAnnouncementItem, deleteAnnouncementItem } from '../controllers/extraControllers.js';
import { protect, admin, adminOrEditor } from '../middleware/authMiddleware.js';

const r = express.Router();
r.get('/', getAnnouncements);
r.get('/admin', protect, admin, getAllAnnouncements);
r.post('/', protect, adminOrEditor, createAnnouncement);
r.put('/:id', protect, adminOrEditor, updateAnnouncementItem);
r.delete('/:id', protect, adminOrEditor, deleteAnnouncementItem);

export default r;
