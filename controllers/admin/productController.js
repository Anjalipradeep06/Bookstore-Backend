import Book from "../../models/bookSchema.js";
import Banner from "../../models/bannerSchema.js";


// ================= BOOKS =================

// GET ALL BOOKS (PAGINATED)
export const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalbooks = await Book.countDocuments();

    return res.status(200).json({
      message: "Books fetched successfully",
      data: books,
      currentPage: page,
      totalPages: Math.ceil(totalbooks / limit),
      totalbooks
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// CREATE BOOK
export const createBook = async (req, res) => {
  try {

    if (!req.user.isAdmin) {
      return res.status(403).json({
        message: "Only admin can create books"
      });
    }

    const {
      title,
      author,
      category,
      description,
      price
    } = req.body;

    const images = req.file ? req.file.path : null;

    if (!title || !title.trim()) return res.status(400).json({ message: "Title required" });
    if (!author || !author.trim()) return res.status(400).json({ message: "Author required" });
    if (!category || !category.trim()) return res.status(400).json({ message: "Category required" });
    if (!description || !description.trim()) return res.status(400).json({ message: "Description required" });
    if (!price || isNaN(price)) return res.status(400).json({ message: "Valid price required" });
    if (!images) return res.status(400).json({ message: "Image required" });

    const book = await Book.create({
      title,
      author,
      category,
      description,
      price,
      images
    });

    return res.status(201).json({
      message: "Book created successfully",
      data: book
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// GET ONE BOOK
export const getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Book fetched",
      data: book
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ================= BANNERS =================


// GET ALL BANNERS (IMPORTANT FIX)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Banners fetched successfully",
      data: banners
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// CREATE BANNER
export const createBanner = async (req, res) => {
  try {

    if (!req.user.isAdmin) {
      return res.status(403).json({
        message: "Only admin can create banner"
      });
    }

    const { title, subtitle } = req.body;

    // if (!title || !title.trim()) {
    //   return res.status(400).json({ message: "Title required" });
    // }

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      imageUrl: req.file.path,
      isActive: false   // IMPORTANT: start inactive
    });

    return res.status(201).json({
      message: "Banner created successfully",
      data: banner
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// ================= TOGGLE BANNER (FIXED) =================
// THIS IS YOUR MAIN REQUIREMENT

export const activateBanner = async (req, res) => {
  try {

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // TOGGLE ONLY THIS BANNER
    banner.isActive = !banner.isActive;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated",
      data: banner
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};