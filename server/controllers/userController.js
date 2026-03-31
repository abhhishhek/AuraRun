import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('_id name email role createdAt');
  res.json(users);
});

export const createUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  const allowed = ['user', 'editor', 'admin'];

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (!allowed.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowed = ['user', 'editor', 'admin'];
  if (!allowed.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.role = role;
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});
