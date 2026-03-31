import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

const slugify = (value) =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// @desc Get all categories (public)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// @desc Create category (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const slug = slugify(name);
  const exists = await Category.findOne({ $or: [{ name }, { slug }] });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    slug,
    description: description || '',
    image: image || '',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json(category);
});

// @desc Update category (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (name && name !== category.name) {
    const slug = slugify(name);
    const exists = await Category.findOne({ _id: { $ne: category._id }, $or: [{ name }, { slug }] });
    if (exists) {
      res.status(400);
      throw new Error('Category name already exists');
    }
    category.name = name;
    category.slug = slug;
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  const updated = await category.save();
  res.json(updated);
});

// @desc Delete category (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ message: 'Category removed' });
});
