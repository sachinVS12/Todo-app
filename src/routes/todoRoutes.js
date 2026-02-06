const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getTodoStats,
} = require("../controllers/todoController");

// All routes are protected
router.use(protect);

router.route("/").get(getTodos).post(createTodo);

router.route("/stats").get(getTodoStats);

router.route("/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

router.route("/:id/toggle").patch(toggleTodo);

module.exports = router;
