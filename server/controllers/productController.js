import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

const resolveCategory = async (value) => {
  if (!value) return null;
  if (isObjectId(value)) return Category.findById(value);
  const normalized = value.toString().trim();
  return Category.findOne({
    $or: [
      { slug: normalized.toLowerCase() },
      { name: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    ],
  });
};

const parseCsvLine = (line = '') => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(current.trim());
  return values;
};

const parseCsvText = (text = '') => {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });

  return { headers, rows };
};

// @desc Get all products with filters
export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12, brand, size, variantGroup } = req.query;

  const query = {};
  if (keyword) query.$text = { $search: keyword };
  if (category) {
    if (isObjectId(category)) {
      query.categoryRef = category;
    } else {
      const found = await resolveCategory(category);
      if (found) query.categoryRef = found._id;
      else query.category = category;
    }
  }
  if (minPrice || maxPrice) query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);
  if (brand) query.brand = new RegExp(brand, 'i');
  if (size) query.sizes = size;
  if (variantGroup) query.variantGroup = variantGroup;

  const sortOptions = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { ratings: -1 },
    popular: { sold: -1 },
  };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('categoryRef', 'name slug')
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ products, page: Number(page), pages: Math.ceil(total / limit), total });
});

// @desc Get single product
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryRef', 'name slug');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

// @desc Create product (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.variantGroup) payload.variantGroup = payload.variantGroup.toString().trim().toLowerCase();
  if (payload.categoryRef || payload.category) {
    const found = await resolveCategory(payload.categoryRef || payload.category);
    if (found) {
      payload.categoryRef = found._id;
      payload.category = found.name;
    } else if (payload.categoryRef && !payload.category) {
      delete payload.categoryRef;
    }
  }
  const product = await Product.create(payload);
  res.status(201).json(product);
});

// @desc Update product (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.variantGroup) payload.variantGroup = payload.variantGroup.toString().trim().toLowerCase();
  if (payload.categoryRef || payload.category) {
    const found = await resolveCategory(payload.categoryRef || payload.category);
    if (found) {
      payload.categoryRef = found._id;
      payload.category = found.name;
    } else if (payload.categoryRef && !payload.category) {
      delete payload.categoryRef;
    }
  }
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate('categoryRef', 'name slug');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

// @desc Bulk update products (admin/editor)
export const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, updates } = req.body || {};

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Product ids are required');
  }

  if (!updates || typeof updates !== 'object') {
    res.status(400);
    throw new Error('Update payload is required');
  }

  const payload = { ...updates };
  if ('price' in payload) payload.price = Number(payload.price);
  if ('stock' in payload) payload.stock = Number(payload.stock);
  if ('comparePrice' in payload) payload.comparePrice = Number(payload.comparePrice);
  if (payload.variantGroup) payload.variantGroup = payload.variantGroup.toString().trim().toLowerCase();

  if (payload.categoryRef || payload.category) {
    const found = await resolveCategory(payload.categoryRef || payload.category);
    if (found) {
      payload.categoryRef = found._id;
      payload.category = found.name;
    } else if (payload.categoryRef && !payload.category) {
      delete payload.categoryRef;
    }
  }

  const result = await Product.updateMany(
    { _id: { $in: ids } },
    { $set: payload },
    { runValidators: true }
  );

  res.json({
    message: 'Products updated',
    matchedCount: result.matchedCount ?? result.n ?? 0,
    modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
  });
});

// @desc Bulk update products from CSV file (admin/editor)
export const bulkUpdateProductsFromCsv = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    res.status(400);
    throw new Error('CSV file is required');
  }

  const text = req.file.buffer.toString('utf-8');
  const { rows } = parseCsvText(text);

  if (!rows.length) {
    res.status(400);
    throw new Error('CSV has no data rows');
  }

  const failed = [];
  let updatedCount = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 2;
    const id = (row.productid || row.id || '').trim();
    const updates = {};

    if (!id) {
      failed.push({ row: rowNumber, reason: 'Missing ProductId' });
      continue;
    }

    if (row.price !== undefined && row.price !== '') {
      const price = Number(row.price);
      if (Number.isNaN(price) || price < 0) {
        failed.push({ row: rowNumber, reason: 'Invalid price value' });
        continue;
      }
      updates.price = price;
    }

    if (row.stock !== undefined && row.stock !== '') {
      const stock = Number(row.stock);
      if (Number.isNaN(stock) || stock < 0) {
        failed.push({ row: rowNumber, reason: 'Invalid stock value' });
        continue;
      }
      updates.stock = stock;
    }

    if (!Object.keys(updates).length) {
      failed.push({ row: rowNumber, reason: 'No updatable fields (price/stock)' });
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!product) {
      failed.push({ row: rowNumber, reason: 'Product not found' });
      continue;
    }
    updatedCount += 1;
  }

  res.json({
    message: 'CSV import processed',
    totalRows: rows.length,
    updatedCount,
    failedCount: failed.length,
    failedRows: failed.slice(0, 50),
  });
});

// @desc Delete product (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  // Delete images from cloudinary
  for (const img of product.images) {
    if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
  }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

// @desc Get categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// @desc Upload product images
export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.length) {
    res.status(400);
    throw new Error('No image files received');
  }
  const images = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
  res.json(images);
});
