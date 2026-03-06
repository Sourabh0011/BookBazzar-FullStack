import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import { createBook, getBooks, getMyBooks, deleteBook } from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ storage });

router.get("/", getBooks);
router.post("/", protect, upload.single("image"), createBook);
router.get("/my", protect, getMyBooks);
router.delete("/:id", protect, deleteBook);

export default router;

