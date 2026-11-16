const express = require('express');
const Announcement = require('../models/Announcement');
const { authenticate, allowRoles } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');

const router = express.Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const filter = { audience: req.user.role, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
  if (req.user.department) filter.$and = [{ $or: [{ department: null }, { department: req.user.department }] }];
  const data = await Announcement.find(filter).populate('author', 'name role').populate('department', 'name code').sort({ createdAt: -1 }).limit(100);
  res.json({ data });
}));

router.post('/', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  const allowed = ['title', 'body', 'audience', 'department', 'expiresAt'];
  rejectUnknown(req.body, allowed);
  if (!req.body.title || !req.body.body) throw new AppError(400, 'title and body are required.');
  const audience = req.body.audience || ['student', 'faculty'];
  if (!Array.isArray(audience) || audience.some((role) => !['student', 'faculty', 'admin'].includes(role))) throw new AppError(400, 'audience must contain valid roles.');
  const data = await Announcement.create({ ...req.body, audience, author: req.user._id });
  res.status(201).json({ data });
}));

router.patch('/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['title', 'body', 'audience', 'department', 'expiresAt']);
  const data = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!data) throw new AppError(404, 'Announcement not found.');
  res.json({ data });
}));

router.delete('/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  const data = await Announcement.findByIdAndDelete(req.params.id);
  if (!data) throw new AppError(404, 'Announcement not found.');
  res.json({ data });
}));

function rejectUnknown(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'A JSON object is required.');
  const unknown = Object.keys(body).find((key) => !allowed.includes(key));
  if (unknown) throw new AppError(400, `Unexpected field: ${unknown}`);
}

module.exports = router;
