const express = require('express');
const User = require('../models/User');
const { authenticate, allowRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { AppError, asyncHandler } = require('../utils/errors');

const router = express.Router();
const userFields = ['name', 'email', 'password', 'role', 'department', 'studentId', 'facultyId', 'phone', 'active'];

router.use(authenticate, allowRoles('admin'));

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (['student', 'faculty', 'admin'].includes(req.query.role)) filter.role = req.query.role;
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  if (search) filter.$or = [{ name: new RegExp(escapeRegex(search), 'i') }, { email: new RegExp(escapeRegex(search), 'i') }];
  const users = await User.find(filter).select('-password').populate('department', 'name code').populate('assignedCourses', 'name code').sort({ createdAt: -1 }).limit(200);
  res.json({ data: users });
}));

router.post('/', validateBody(['name', 'email', 'password', 'role']), asyncHandler(async (req, res) => {
  const input = pick(req.body, userFields);
  if (!['admin', 'student', 'faculty'].includes(input.role)) throw new AppError(400, 'Invalid role.');
  if (typeof input.password !== 'string' || input.password.length < 10 || input.password.length > 128) throw new AppError(400, 'Password must be between 10 and 128 characters.');
  const user = await User.create(input);
  res.status(201).json({ data: user });
}));

router.patch('/:id', validateBody([], userFields), asyncHandler(async (req, res) => {
  if (!Object.keys(req.body).length) throw new AppError(400, 'Provide at least one field to update.');
  const input = pick(req.body, userFields);
  if (input.role && !['admin', 'student', 'faculty'].includes(input.role)) throw new AppError(400, 'Invalid role.');
  if (input.password !== undefined && (typeof input.password !== 'string' || input.password.length < 10 || input.password.length > 128)) throw new AppError(400, 'Password must be between 10 and 128 characters.');
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'User not found.');
  Object.assign(user, input);
  await user.save();
  res.json({ data: user });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new AppError(400, 'You cannot deactivate your own account.');
  const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!user) throw new AppError(404, 'User not found.');
  res.json({ data: user });
}));

function pick(value, fields) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => fields.includes(key)));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
