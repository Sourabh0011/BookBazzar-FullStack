import type { Request, Response } from "express";
import Book from "../models/Book.js";

// @desc    Create a new book listing
// @route   POST /api/books
export const createBook = async (req: any, res: Response) => {
  const { title, author, price, is_swap, condition, category, description } = req.body;

  try {
    // If a file was uploaded, store its URL (Cloudinary provides this in req.file.path)
    let image_url = "";
    if (req.file) {
      image_url = req.file.path;
    }

    const book = await Book.create({
      user: req.user._id,
      title,
      author,
      price: is_swap === 'true' || is_swap === true ? null : Number(price),
      is_swap: is_swap === 'true' || is_swap === true,
      condition,
      category,
      description,
      image_url,
    } as any);

    res.status(201).json(book);
  } catch (error: any) {
    console.error("Create Book Error:", error);
    res.status(500).json({ message: "Error creating book listing", error: error.message });
  }
};

// @desc    Get all books
// @route   GET /api/books
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().populate("user", "username avatar_url").sort("-created_at");
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
};

// @desc    Get user's books
// @route   GET /api/books/my
export const getMyBooks = async (req: any, res: Response) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort("-created_at");
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching your books", error: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
export const deleteBook = async (req: any, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await book.deleteOne();
    res.json({ message: "Book removed" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting book", error: error.message });
  }
};
