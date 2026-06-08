import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  imageUrl: { type: String, required: true }, // Cloudinary link
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);