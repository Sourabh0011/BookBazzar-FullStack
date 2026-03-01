import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bookswap";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Book Swap Backend is running! 🚀");
});

// Conditionally listen only if not in production environment (like Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel
export default app;
