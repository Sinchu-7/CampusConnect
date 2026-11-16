const express = require('express');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Announcement = require('../models/Announcement');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errors');

const router = express.Router();
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const role = req.user.role;
  const [students, faculty, departments, courses, attendance, marks, announcements] = await Promise.all([
    role === 'admin' ? User.countDocuments({ role: 'student', active: true }) : User.countDocuments({ role: 'student', department: req.user.department, active: true }),
    role === 'admin' ? User.countDocuments({ role: 'faculty', active: true }) : User.countDocuments({ role: 'faculty', department: req.user.department, active: true }),
    Department.countDocuments(),
    role === 'faculty' ? Course.countDocuments({ faculty: req.user._id }) : Course.countDocuments(req.user.department && role === 'student' ? { department: req.user.department } : {}),
    Attendance.countDocuments(role === 'student' ? { student: req.user._id } : role === 'faculty' ? { course: { $in: req.user.assignedCourses } } : {}),
    Mark.countDocuments(role === 'student' ? { student: req.user._id } : role === 'faculty' ? { course: { $in: req.user.assignedCourses } } : {}),
    Announcement.countDocuments({ audience: role, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] })
  ]);
  res.json({ data: { students, faculty, departments, courses, attendance, marks, announcements, role } });
}));

module.exports = router;
