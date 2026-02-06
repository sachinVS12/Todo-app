const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: {
      values: ["low", "medium", "high"],
      message: "Priority must be low, medium, or high",
    },
    default: "medium",
  },
  dueDate: {
    type: Date,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  category: {
    type: String,
    trim: true,
    default: "general",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
todoSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Todo", todoSchema);
