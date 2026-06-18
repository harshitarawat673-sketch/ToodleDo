const Todo = require("../models/Todo");

const getTodos = async (req, res) => {
  const { category, priority, completed } = req.query;

  const filter = {
    userId: req.user.id,
  };

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = Number(priority);
  }

  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  const todos = await Todo.find(filter);

  res.json(todos);
};

const createTodo = async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (priority === undefined || priority < 1 || priority > 3) {
    return res.status(400).json({
      message: "Priority must be between 1 and 3",
    });
  }

  const newTodo = await Todo.create({
    title,
    description,
    category,
    priority,
    completed: false,
    userId: req.user.id,
  });

  res.status(201).json(newTodo);
};

const updateTodo = async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    req.body,
    { new: true }
  );

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.json(todo);
};

const deleteTodo = async (req, res) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.json({ message: "Todo deleted" });
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};