import Wishlist from "../../models/wishListSchema.js";
import Book from "../../models/bookSchema.js";
import mongoose from "mongoose";


// ==========================
// GET WISHLIST
// ==========================
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "books",
          foreignField: "_id",
          as: "books",
        },
      },
    ]);

    const result = wishlist[0] || {
      userId: req.user.id,
      books: [],
    };

    return res.status(200).json({
      success: true,
      message: "Fetched wishlist successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// ==========================
// ADD TO WISHLIST
// ==========================
export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book is required",
      });
    }

    // check book exists
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // find wishlist for user
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    // if wishlist doesn't exist, create it
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user.id,
        books: [bookId],
      });

      return res.status(201).json({
        success: true,
        message: "Added to wishlist",
        data: bookId,
      });
    }

    // check if already exists
    const exists = wishlist.books.some(
      (id) => id.toString() === bookId.toString()
    );

    if (exists) {
      return res.status(200).json({
        success: true,
        message: "Already in wishlist",
        data: bookId,
      });
    }

    // add new book
    wishlist.books.push(bookId);
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      data: bookId,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};