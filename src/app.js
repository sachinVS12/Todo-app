const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to To-Do List API",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        getProfile: "GET /api/auth/me",
      },
      todos: {
        getAll: "GET /api/todos",
        create: "POST /api/todos",
        getStats: "GET /api/todos/stats",
        getOne: "GET /api/todos/:id",
        update: "PUT /api/todos/:id",
        delete: "DELETE /api/todos/:id",
        toggle: "PATCH /api/todos/:id/toggle",
      },
    },
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
