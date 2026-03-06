import type { Response } from "express";
import Notification from "../models/Notification.js";

// @desc    Get user notifications
// @route   GET /api/notifications
export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort("-created_at")
      .limit(20);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
export const markAsRead = async (req: any, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    notification.is_read = true;
    await notification.save();

    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};
