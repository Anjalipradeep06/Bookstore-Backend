import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';

// 🔌 Import All Bookstore REST API Route Modules (with required .js extensions)
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartWishlistRoutes from './routes/cartWishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// Setup __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Connect to MongoDB
connectDB();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); 

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Mount Clean REST Routes
console.log("");

app.use('/', authRoutes);
app.use('/products', productRoutes);       // Handles book catalog, searches, and admin banners
app.use('/cartlist', cartWishlistRoutes);   // Handles cart and wishlist endpoints
app.use('/orders', orderRoutes);             // Handles user checkouts and admin order updates
app.use('/admin', adminRoutes);
// Global Error Handler
app.use((err, req, res, next) => {

  console.error(" FULL ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err
  });

});

export default app;