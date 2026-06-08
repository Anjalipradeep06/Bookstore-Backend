import express from "express";

import {
  getDashboard,
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAllOrders,
  updateOrderStatus,
  adminGetAllBooks,
  deleteBook,updateBook
} from "../controllers/admin/adminController.js";

import {
  createBook,
  createBanner,
  activateBanner,
} from "../controllers/admin/productController.js";

import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/admin/categoryController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";

const router = express.Router();


// ================= DASHBOARD =================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboard
);


// ================= CATEGORIES =================

router.get(
  "/categories",
  protect,
  adminOnly,
  getCategories
);

router.post(
  "/categories",
  protect,
  adminOnly,
  createCategory
);

router.delete(
  "/categories/:id",
  protect,
  adminOnly,
  deleteCategory
);


// ================= USERS =================

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);

router.put(
  "/users/:id/status",
  protect,
  adminOnly,
  toggleUserStatus
);


// ================= ORDERS =================

router.get(
  "/orders",
  protect,
  adminOnly,
  getAllOrders
);

router.put(
  "/orders/:id",
  protect,
  adminOnly,
  updateOrderStatus
);


// ================= BOOKS =================

router.get(
  "/books",
  protect,
  adminOnly,
  adminGetAllBooks
);

router.post(
  "/books/create",
  protect,
  adminOnly,
  upload.single("image"),
  createBook
);


// route — add under the BOOKS section
router.put(
  "/books/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateBook
);

router.delete(
  "/books/:id",
  protect,
  adminOnly,
  deleteBook
);


// ================= BANNERS =================

router.post(
  "/banners/create",
  protect,
  adminOnly,
  upload.single("image"),
  createBanner
);

router.put(
  "/banners/activate/:id",
  protect,
  adminOnly,
  activateBanner
);

export default router;