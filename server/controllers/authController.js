import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/mailer.js';
import { buildResetPasswordTemplate, buildSignupOtpTemplate, buildVerifyEmailTemplate } from '../utils/emailTemplates.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const generateSixDigitOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const getVerifyUrl = (token) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${base}/profile?verifyToken=${encodeURIComponent(token)}`;
};

const getResetUrl = (token) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${base}/forgot-password?token=${encodeURIComponent(token)}`;
};

// @desc Register user
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.toLowerCase?.().trim();
  if (!name?.trim() || !normalizedEmail || !password?.trim()) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (user && user.isEmailVerified) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = generateSixDigitOtp();
  const otpHash = hashOtp(otp);
  const otpExpiry = Date.now() + 1000 * 60 * 10; // 10 minutes

  if (!user) {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      isEmailVerified: false,
      signupOtpHash: otpHash,
      signupOtpExpires: otpExpiry,
    });
  } else {
    user.name = name;
    user.password = password;
    user.signupOtpHash = otpHash;
    user.signupOtpExpires = otpExpiry;
    user.isEmailVerified = false;
    await user.save();
  }

  const otpEmailTemplate = buildSignupOtpTemplate({
    name: user.name,
    otp,
  });
  await sendEmail({ to: user.email, subject: otpEmailTemplate.subject, html: otpEmailTemplate.html });

  res.status(200).json({
    message: 'OTP sent to your email',
    email: user.email,
  });
});

// @desc Verify signup OTP and activate account
export const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email?.toLowerCase?.().trim();
  if (!normalizedEmail || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.signupOtpHash || !user.signupOtpExpires) {
    res.status(400);
    throw new Error('No signup OTP found. Please register again.');
  }

  if (user.signupOtpExpires.getTime() < Date.now()) {
    res.status(400);
    throw new Error('OTP expired. Please request a new one.');
  }

  const incomingHash = hashOtp(String(otp).trim());
  if (incomingHash !== user.signupOtpHash) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  user.isEmailVerified = true;
  user.signupOtpHash = '';
  user.signupOtpExpires = null;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isEmailVerified) {
    res.status(401);
    throw new Error('Please verify OTP sent to your email before login');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc Get logged in user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.addresses) user.addresses = req.body.addresses;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    token: generateToken(updated._id),
  });
});

// @desc Request password reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('User not found'); }
  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
  await user.save();

  const resetEmailTemplate = buildResetPasswordTemplate({
    name: user.name,
    resetUrl: getResetUrl(token),
  });
  await sendEmail({ to: user.email, subject: resetEmailTemplate.subject, html: resetEmailTemplate.html });

  res.json({ message: 'Password reset email sent' });
});

// @desc Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Invalid or expired token'); }
  user.password = password;
  user.resetPasswordToken = '';
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ message: 'Password updated' });
});

// @desc Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Invalid or expired token'); }
  user.isEmailVerified = true;
  user.emailVerificationToken = '';
  user.emailVerificationExpires = null;
  await user.save();
  res.json({ message: 'Email verified' });
});

// @desc Request email verification token
export const requestEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('User not found'); }
  const token = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24;
  await user.save();

  const verifyEmailTemplate = buildVerifyEmailTemplate({
    name: user.name,
    verifyUrl: getVerifyUrl(token),
  });
  await sendEmail({ to: user.email, subject: verifyEmailTemplate.subject, html: verifyEmailTemplate.html });

  res.json({ message: 'Verification email sent' });
});

// @desc Delete logged in user account
export const deleteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: 'Account deleted' });
});
