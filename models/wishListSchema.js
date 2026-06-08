import mongoose from 'mongoose';

const wishListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }]
}, { timestamps: true });

export default mongoose.model('Wishlist', wishListSchema);