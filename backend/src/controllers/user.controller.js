// src/controllers/user.controller.js
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users?search=&page=1&limit=10&sort=-createdAt
exports.list = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// GET /api/users/:id
exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// POST /api/users/

exports.create = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Request body is required (JSON).' });
  }

  const { name, surname, email, age, role } = req.body;

  // your schema requires surname, so validate it too:
  if (!name || !surname || !email) {
    return res.status(400).json({ message: 'name, surname, and email are required' });
  }

  const user = await User.create({ name, surname, email, age, role });
  res.status(201).json(user);
});

// PATCH /api/users/:id
exports.update = asyncHandler(async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// DELETE /api/users/:id
exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(204).send(); // no body
});
