import { Response } from "express";
import Transaction from "../models/Transaction";
import Notification from "../models/Notification";
import Book from "../models/Book";

// @desc    Create a new transaction
// @route   POST /api/transactions
export const createTransaction = async (req: any, res: Response) => {
  const { bookId, sellerId, type, paymentMethod, address_line, city, state, pincode, phone } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const transaction = await Transaction.create({
      book: bookId,
      buyer: req.user._id,
      seller: sellerId,
      type,
      payment_method: paymentMethod,
      address_line,
      city,
      state,
      pincode,
      phone,
    });

    // Create Notification for Seller
    await Notification.create({
      user: sellerId,
      title: "New Order Received! 🎉",
      message: `Someone wants to buy "${book.title}" for ₹${book.price}. Payment: ${paymentMethod === "cash" ? "Cash on Delivery" : "Online Payment"}.`,
      related_transaction: transaction._id,
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating transaction", error: error.message });
  }
};

// @desc    Get user transactions (both as buyer and seller)
// @route   GET /api/transactions
export const getTransactions = async (req: any, res: Response) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate("book")
      .populate("buyer", "username email")
      .populate("seller", "username email")
      .sort("-created_at");

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

// @desc    Update transaction status
// @route   PUT /api/transactions/:id
export const updateTransactionStatus = async (req: any, res: Response) => {
  const { status } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (
      transaction.seller.toString() !== req.user._id.toString() &&
      transaction.buyer.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: "User not authorized" });
    }

    transaction.status = status;
    await transaction.save();

    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating transaction", error: error.message });
  }
};
