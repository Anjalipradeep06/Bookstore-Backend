import 'dotenv/config';

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: 'books',
  }),
});

const upload = multer({ storage });

export default upload;