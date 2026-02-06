const Todo = require("../models/Todo");

// @desc    Get all todos
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res) => {
  try {
    const {
      search,
      completed,
      priority,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query = { user: req.user._id };

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by completed status
    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const todos = await Todo.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Todo.countDocuments(query);

    res.json({
      todos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single todo
// @route   GET /api/todos/:id
// @access  Private
const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags, category } = req.body;

    const todo = await Todo.create({
      user: req.user._id,
      title,
      description,
      priority,
      dueDate,
      tags,
      category,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate, tags, category } =
      req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title,
        description,
        completed,
        priority,
        dueDate,
        tags,
        category,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true },
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle todo completion status
// @route   PATCH /api/todos/:id/toggle
// @access  Private
const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    todo.updatedAt = Date.now();
    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get todos statistics
// @route   GET /api/todos/stats
// @access  Private
const getTodoStats = async (req, res) => {
  try {
    const totalTodos = await Todo.countDocuments({ user: req.user._id });
    const completedTodos = await Todo.countDocuments({
      user: req.user._id,
      completed: true,
    });
    const pendingTodos = totalTodos - completedTodos;

    // Get todos by priority
    const priorityStats = await Todo.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Get todos by category
    const categoryStats = await Todo.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      total: totalTodos,
      completed: completedTodos,
      pending: pendingTodos,
      completionRate: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0,
      priorityStats,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getTodoStats,
};
