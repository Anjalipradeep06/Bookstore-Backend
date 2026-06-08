import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false }, // Crucial for the Admin Dashboard!
  isActive:{ type:Boolean, required:true,default:false}
}, { timestamps: true });


export default mongoose.model('User', userSchema);