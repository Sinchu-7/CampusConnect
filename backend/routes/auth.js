const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { AppError, asyncHandler } = require('../utils/errors');

const router = express.Router();
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});

function issueSession(user, res) {
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
  res.cookie('campusconnect_token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000
  });
}

router.post(
  '/register',
  loginLimit,
  validateBody(['name', 'email', 'password', 'role'], ['department', 'studentId', 'facultyId', 'phone']),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, department, studentId, facultyId, phone } = req.body;
    if (!['student', 'faculty'].includes(role)) throw new AppError(400, 'Only student and faculty self-registration is allowed.');
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
      throw new AppError(400, 'Password must be between 10 and 128 characters.');
    }
    if (await User.exists({ email: String(email).toLowerCase() })) {
      throw new AppError(409, 'An account with this email already exists.');
    }
    const user = await User.create({ name, email, password, role, department, studentId, facultyId, phone });
    issueSession(user, res);
    res.status(201).json({ user });
  })
);

router.post(
  '/login',
  loginLimit,
  validateBody(['email', 'password']),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: String(req.body.email).toLowerCase() }).select('+password');
    if (!user || !user.active || !(await user.comparePassword(req.body.password))) {
      throw new AppError(401, 'Email or password is incorrect.');
    }
    issueSession(user, res);
    res.json({ user });
  })
);

router.post('/logout', (req, res) => {
  res.clearCookie('campusconnect_token', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict'
  });
  res.json({ message: 'Signed out successfully.' });
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

router.patch(
  '/me',
  authenticate,
  validateBody([], ['name', 'phone', 'password']),
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'phone', 'password'];
    const keys = Object.keys(req.body);
    if (!keys.length) throw new AppError(400, 'Provide at least one profile field to update.');
    if (req.body.password !== undefined && (typeof req.body.password !== 'string' || req.body.password.length < 10 || req.body.password.length > 128)) {
      throw new AppError(400, 'Password must be between 10 and 128 characters.');
    }
    for (const key of keys) {
      if (!allowed.includes(key)) throw new AppError(400, `Unexpected field: ${key}`);
      if (key !== 'password') req.user[key] = req.body[key];
    }
    if (req.body.password) req.user.password = req.body.password;
    await req.user.save();
    res.json({ user: req.user });
  })
);

module.exports = router;
