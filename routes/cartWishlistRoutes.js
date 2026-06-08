import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/user/cartController.js';
import { addToWishlist, getWishlist } from '../controllers/user/wishListController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Cart paths
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.delete('/cart/remove/:id', removeFromCart);

// Wishlist paths
router.get('/wishlist', getWishlist);
router.post('/addlist', addToWishlist);

export default router;