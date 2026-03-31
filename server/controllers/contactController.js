import asyncHandler from 'express-async-handler';
import ContactMessage from '../models/ContactMessage.js';

// @desc Create contact inquiry (public)
export const createContactMessage = asyncHandler(async (req, res) => {
  const {
    name = '',
    email = '',
    phone = '',
    company = '',
    subject = '',
    message = '',
  } = req.body || {};

  if (!name.trim() || !email.trim() || !message.trim()) {
    res.status(400);
    throw new Error('Name, email and message are required');
  }

  const created = await ContactMessage.create({
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    company: company.trim(),
    subject: subject.trim(),
    message: message.trim(),
  });

  res.status(201).json({
    message: 'Message received',
    contact: created,
  });
});

// @desc Get all contact inquiries (admin/editor)
export const getContactMessages = asyncHandler(async (req, res) => {
  const { status = '', search = '' } = req.query;

  const query = {};
  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { subject: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
  }

  const items = await ContactMessage.find(query)
    .populate('handledBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ items, total: items.length });
});

// @desc Update inquiry status (admin/editor)
export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['new', 'in_progress', 'resolved'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const item = await ContactMessage.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  item.status = status;
  item.handledBy = req.user?._id || item.handledBy;
  item.handledAt = new Date();
  await item.save();

  const populated = await item.populate('handledBy', 'name email role');
  res.json(populated);
});

// @desc Delete inquiry (admin/editor)
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const item = await ContactMessage.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  await item.deleteOne();
  res.json({ message: 'Contact message deleted' });
});
