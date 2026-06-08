import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, required: true }, 
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array of Cloudinary cover image URLs
  isFeatured: { type: Boolean, default: false }, // For homepage banners/sliders
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false }
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', category: 'text' });

export default mongoose.model('Book', bookSchema);