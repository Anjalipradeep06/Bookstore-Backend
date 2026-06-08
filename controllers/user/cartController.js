import Cart from "../../models/cartSchema.js";
import Book from "../../models/bookSchema.js";
import mongoose from "mongoose";

// ================= GET CART (FIXED SAFE VERSION) =================
export const getCart = async (req, res) => {
  try {
    const viewcart = await Cart.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      { $unwind: "$items" },

      {
        $lookup: {
          from: "books",
          localField: "items.bookId",
          foreignField: "_id",
          as: "book",
        },
      },

      {
        $unwind: {
          path: "$book",
          preserveNullAndEmptyArrays: false,
        },
      },

      {
        $project: {
          cartItemId: "$_id",
          bookId: "$book._id",
          title: "$book.title",
          author: "$book.author",
          price: "$book.price",
          images: "$book.images",
          quantity: "$items.quantity",
        },
      },
    ]);

    res.status(200).json({
      message: "Fetched cart successfully",
      data: viewcart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= ADD TO CART =================
export const addToCart = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    let addedItem;

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [{ bookId, quantity: 1 }],
        totalPrice: book.price,
      });

      addedItem = { bookId, quantity: 1 };
    } else {
      const index = cart.items.findIndex(
        (i) => i.bookId.toString() === bookId
      );

      if (index > -1) {
        cart.items[index].quantity += 1;
        addedItem = cart.items[index];
      } else {
        cart.items.push({ bookId, quantity: 1 });
        addedItem = { bookId, quantity: 1 };
      }

      // recalc price safely
      let total = 0;

      for (const item of cart.items) {
        const b = await Book.findById(item.bookId);
        if (b) total += (b.price || 0) * item.quantity;
      }

      cart.totalPrice = total;

      await cart.save();
    }

    res.status(200).json({
      message: "Added to cart",
      addedItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= REMOVE FROM CART (FIXED) =================
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const before = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.bookId.toString() !== req.params.id
    );

    if (before === cart.items.length) {
      return res.status(404).json({ message: "Item not found" });
    }

    await cart.save();

    res.status(200).json({
      message: "Removed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};