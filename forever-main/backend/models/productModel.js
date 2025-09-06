// models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: [{ type: String }],
  bestseller: { type: Boolean, default: false },

  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: true
  },

  images: {
    type: [String], // ✅ Now accepts an array of image URLs
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ Only if you're linking to a User model
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  date: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
