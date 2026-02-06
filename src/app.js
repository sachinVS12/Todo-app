// Load environment variables FIRST
require("dotenv").config();

// Use fallback values if .env is missing
process.env.PORT = process.env.PORT || 5000;
process.env.MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/todo_app";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "fallback_secret_key_for_development_only_change_in_production";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "30d";
process.env.NODE_ENV = process.env.NODE_ENV || "development";

console.log("=== Environment Configuration ===");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set ✓" : "Not set ✗");
console.log("JWT_EXPIRE:", process.env.JWT_EXPIRE);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=================================");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Basic routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Todo API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI}`);
});
