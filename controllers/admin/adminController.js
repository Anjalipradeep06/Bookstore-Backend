import Book from '../../models/bookSchema.js';
import User from '../../models/User.js';
import Order from '../../models/orderSchema.js';

// DASHBOARD
export const getDashboard = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Dynamic Revenue Calculation (quantity * priceAtPurchase)
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: { $multiply: ['$priceAtPurchase', '$quantity'] } 
          }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const booksByCategory = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    return res.status(200).json({
      success: true,
      dashboard: {
        totalBooks,
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue,
        booksByCategory,
        ordersByStatus,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, totalUsers: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE USER STATUS
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    return res.status(200).json({ success: true, message: 'User status updated', isActive: user.isActive });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title price')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, totalOrders: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = status;
    await order.save();
    return res.status(200).json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN GET ALL BOOKS
export const adminGetAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, totalBooks: books.length, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE BOOK
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    await Book.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// UPDATE BOOK
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const { title, author, category, description, price } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (category) book.category = category;
    if (description) book.description = description;
    if (price) book.price = price;

    // Only update image if a new one was uploaded
    if (req.file) {
      book.imageUrl = req.file.path; // adjust to match your upload field (e.g. req.file.location for S3)
    }

    await book.save();

    return res.status(200).json({ success: true, message: 'Book updated successfully', data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};