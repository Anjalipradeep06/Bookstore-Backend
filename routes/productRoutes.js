import express from 'express';

import {
  getAllBooks,
  getAllBanners,
  getOneBook,
  searchBooks
} from '../controllers/admin/productController.js';

const router = express.Router();


// PUBLIC PRODUCT ROUTES

router.get('/', getAllBooks);


router.get('/banners', getAllBanners);
router.get('/search', searchBooks);

router.get('/:id', getOneBook);

export default router;