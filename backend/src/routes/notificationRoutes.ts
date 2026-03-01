import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id", protect, markAsRead);

export default router;
