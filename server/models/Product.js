import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    images: [{ url: String, public_id: String }],
    category: { type: String, required: true }, // keep name for backward compatibility
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: String, default: '' },
    variantGroup: { type: String, default: '', trim: true },
    colorName: { type: String, default: '', trim: true },
    colorHex: { type: String, default: '', trim: true },
    stock: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    sold: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    weight: { type: Number, default: 0 },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
