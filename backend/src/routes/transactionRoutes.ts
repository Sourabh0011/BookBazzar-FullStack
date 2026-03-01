import express from "express";
import { createTransaction, getTransactions, updateTransactionStatus } from "../controllers/transactionController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions);
router.put("/:id", protect, updateTransactionStatus);

export default router;
