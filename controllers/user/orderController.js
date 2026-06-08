import Order from '../../models/orderSchema.js';
import Cart from '../../models/cartSchema.js';
import Book from '../../models/bookSchema.js';

// CREATE ORDER FOR A SPECIFIC BOOK FROM THE CART (Route: POST /api/orders/:id)
export const createOrder = async (req, res) => {
  try {
    const bookId = req.params.id; 
    const { shippingAddress } = req.body;

    // 1. Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // 2. Find the specific book item inside the cart
    const cartItem = cart.items.find(item => item.bookId.toString() === bookId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'This book is not in your cart'
      });
    }

    // 3. Fetch book details for price verification
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in database catalog'
      });
    }

    // 4. Create Minimal Order
    const order = await Order.create({
      userId: req.user.id,
      bookId: book._id,
      title: book.title,
      quantity: cartItem.quantity,
      priceAtPurchase: book.price,
      shippingAddress,
      status: 'Pending'
    });

    // 5. Remove only this item from the cart
    cart.items = cart.items.filter(item => item.bookId.toString() !== bookId);
    
    // Recalculate remaining cart total if your cart uses it
    if (cart.totalPrice) {
      cart.totalPrice = Math.max(0, cart.totalPrice - ((book.price || 0) * cartItem.quantity));
    }
    
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully from cart item',
      orderId: order._id,
      data: order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('bookId', 'title images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};