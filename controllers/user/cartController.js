import Cart from "../../models/cartSchema.js";
import Book from "../../models/bookSchema.js";
import mongoose from "mongoose";

export const getCart = async (req, res) => {
  try {
    const viewcart = await Cart.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: "books",
          localField: "items.bookId",
          foreignField: "_id",
          as: "book"
        }
      },
      {
        $unwind: "$book"
      },
      {
        $project: {
          _id: "$book._id",
          title: "$book.title",
          author: "$book.author",
          price: "$book.price",
          images: "$book.images",
          quantity: "$items.quantity"
        }
      }
    ]);

    res.status(200).json({
      message: "Fetched your cart successfully",
      data: viewcart
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book is required" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    let addedItem = null;

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [{ bookId, quantity: 1 }],
        totalPrice: book.price || 0
      });

      addedItem = { bookId, quantity: 1 };
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.bookId.toString() === bookId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
        addedItem = cart.items[itemIndex];
      } else {
        const newItem = { bookId, quantity: 1 };
        cart.items.push(newItem);
        addedItem = newItem;
      }

      // recalc price
      let total = 0;
      for (const item of cart.items) {
        const b = await Book.findById(item.bookId);
        total += (b.price || 0) * item.quantity;
      }

      cart.totalPrice = total;

      await cart.save();
    }

    return res.status(200).json({
      message: "added to cart",
      addedItem   
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      item => item.bookId.toString() !== req.params.id
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};