// authRoutes.js
import express from 'express';
import { registerUser, verifySignupOtp, loginUser, getUserProfile, updateUserProfile, requestPasswordReset, resetPassword, verifyEmail, requestEmailVerification, deleteUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', registerUser);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/login', loginUser);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/request-verify', requestEmailVerification);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

export default router;
