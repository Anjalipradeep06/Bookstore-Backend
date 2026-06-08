import express from 'express';

import {
  createOrder,
  getMyOrders
} from '../controllers/user/orderController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


// CUSTOMER ORDER ROUTES

router.post('/create/:id', protect, createOrder);

router.get('/myorders', protect, getMyOrders);


export default router;