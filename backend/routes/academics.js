const express = require('express');
const Department = require('../models/Department');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, allowRoles } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');

const router = express.Router();
router.use(authenticate);

router.get('/departments', asyncHandler(async (req, res) => {
  const data = await Department.find().populate('head', 'name email').sort({ name: 1 });
  res.json({ data });
}));

router.get('/students', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  const filter = { role: 'student', active: true };
  if (req.user.role === 'faculty') {
    const assigned = await Course.find({ faculty: req.user._id }).distinct('department');
    filter.department = { $in: assigned };
  }
  const data = await User.find(filter).select('name email studentId department').populate('department', 'name code').sort({ name: 1 }).limit(500);
  res.json({ data });
}));

router.post('/departments', allowRoles('admin'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['name', 'code', 'description', 'head']);
  const { name, code, description = '', head = null } = req.body || {};
  if (!name || !code) throw new AppError(400, 'name and code are required.');
  if (head && !(await User.exists({ _id: head, role: 'faculty', active: true }))) throw new AppError(400, 'Department head must be an active faculty member.');
  const data = await Department.create({ name, code, description, head });
  res.status(201).json({ data });
}));

router.patch('/departments/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  const allowed = ['name', 'code', 'description', 'head'];
  rejectUnknown(req.body, allowed);
  if (req.body.head && !(await User.exists({ _id: req.body.head, role: 'faculty', active: true }))) {
    throw new AppError(400, 'Department head must be an active faculty member.');
  }
  const data = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!data) throw new AppError(404, 'Department not found.');
  res.json({ data });
}));

router.delete('/departments/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  const linkedCourse = await Course.exists({ department: req.params.id });
  if (linkedCourse) throw new AppError(409, 'Move or remove courses in this department before deleting it.');
  const data = await Department.findByIdAndDelete(req.params.id);
  if (!data) throw new AppError(404, 'Department not found.');
  res.json({ data });
}));

router.get('/courses', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'faculty') filter.faculty = req.user._id;
  if (req.query.department) filter.department = req.query.department;
  const data = await Course.find(filter).populate('department', 'name code').populate('faculty', 'name email').sort({ name: 1 });
  res.json({ data });
}));

router.post('/courses', allowRoles('admin'), asyncHandler(async (req, res) => {
  const allowed = ['name', 'code', 'department', 'faculty', 'credits', 'semester', 'description'];
  rejectUnknown(req.body, allowed);
  const { name, code, department, semester } = req.body || {};
  if (!name || !code || !department || semester === undefined) throw new AppError(400, 'name, code, department, and semester are required.');
  await validateFacultyAssignments(req.body.faculty || []);
  const data = await Course.create(req.body);
  await syncFacultyAssignments(data);
  res.status(201).json({ data });
}));

router.patch('/courses/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['name', 'code', 'department', 'faculty', 'credits', 'semester', 'description']);
  if (req.body.faculty !== undefined) await validateFacultyAssignments(req.body.faculty);
  const data = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!data) throw new AppError(404, 'Course not found.');
  await syncFacultyAssignments(data);
  res.json({ data });
}));

router.delete('/courses/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  const data = await Course.findByIdAndDelete(req.params.id);
  if (!data) throw new AppError(404, 'Course not found.');
  await User.updateMany({ assignedCourses: req.params.id }, { $pull: { assignedCourses: req.params.id } });
  res.json({ data });
}));

async function syncFacultyAssignments(course) {
  await User.updateMany({ assignedCourses: course._id }, { $pull: { assignedCourses: course._id } });
  await User.updateMany({ _id: { $in: course.faculty } }, { $addToSet: { assignedCourses: course._id } });
}

async function validateFacultyAssignments(facultyIds) {
  if (!Array.isArray(facultyIds)) throw new AppError(400, 'faculty must be a list of faculty account IDs.');
  const count = await User.countDocuments({ _id: { $in: facultyIds }, role: 'faculty', active: true });
  if (count !== new Set(facultyIds.map(String)).size) throw new AppError(400, 'Every assigned course instructor must be an active faculty member.');
}

function rejectUnknown(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'A JSON object is required.');
  const unknown = Object.keys(body).find((key) => !allowed.includes(key));
  if (unknown) throw new AppError(400, `Unexpected field: ${unknown}`);
}

module.exports = router;
