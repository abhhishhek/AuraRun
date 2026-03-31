import express from 'express';
import { getAnnouncement, updateAnnouncement } from '../controllers/extraControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = express.Router();
// public read
r.get('/announcement', getAnnouncement);
// admin update
r.put('/announcement', protect, admin, updateAnnouncement);

export default r;
