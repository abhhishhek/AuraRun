import express from 'express';
import { getUsers, updateUserRole, createUserByAdmin } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = express.Router();
r.route('/').get(protect, admin, getUsers).post(protect, admin, createUserByAdmin);
r.put('/:id/role', protect, admin, updateUserRole);

export default r;
