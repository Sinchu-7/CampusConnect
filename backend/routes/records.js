const express = require('express');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, allowRoles } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');

const router = express.Router();
router.use(authenticate);

router.get('/attendance', asyncHandler(async (req, res) => {
  const filter = scopeCourseRecords(req.user, 'faculty');
  if (req.user.role === 'student') filter.student = req.user._id;
  if (req.query.student && req.user.role === 'admin') filter.student = req.query.student;
  if (req.query.course) {
    if (req.user.role === 'faculty' && !req.user.assignedCourses.some((courseId) => courseId.equals(req.query.course))) {
      throw new AppError(403, 'Faculty can only view records for assigned courses.');
    }
    filter.course = req.query.course;
  }
  const data = await Attendance.find(filter).populate('student', 'name studentId').populate('course', 'name code').populate('faculty', 'name').sort({ date: -1 }).limit(500);
  res.json({ data });
}));

router.post('/attendance', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['student', 'course', 'date', 'status', 'note']);
  const { student, course, date, status, note = '' } = req.body || {};
  if (!student || !course || !date || !status) throw new AppError(400, 'student, course, date, and status are required.');
  await ensureAssignedCourse(req.user, course);
  if (!(await User.exists({ _id: student, role: 'student', active: true }))) throw new AppError(400, 'A valid active student is required.');
  const data = await Attendance.create({ student, course, date, status, note, faculty: req.user._id });
  res.status(201).json({ data });
}));

router.patch('/attendance/:id', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['status', 'date', 'note']);
  const current = await Attendance.findById(req.params.id);
  if (!current) throw new AppError(404, 'Attendance record not found.');
  await ensureAssignedCourse(req.user, current.course);
  Object.assign(current, req.body);
  await current.save();
  res.json({ data: current });
}));

router.delete('/attendance/:id', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  const current = await Attendance.findById(req.params.id);
  if (!current) throw new AppError(404, 'Attendance record not found.');
  await ensureAssignedCourse(req.user, current.course);
  await current.deleteOne();
  res.json({ data: current });
}));

router.get('/marks', asyncHandler(async (req, res) => {
  const filter = scopeCourseRecords(req.user, 'faculty');
  if (req.user.role === 'student') filter.student = req.user._id;
  if (req.query.student && req.user.role === 'admin') filter.student = req.query.student;
  if (req.query.course) {
    if (req.user.role === 'faculty' && !req.user.assignedCourses.some((courseId) => courseId.equals(req.query.course))) {
      throw new AppError(403, 'Faculty can only view records for assigned courses.');
    }
    filter.course = req.query.course;
  }
  const data = await Mark.find(filter).populate('student', 'name studentId').populate('course', 'name code').populate('faculty', 'name').sort({ createdAt: -1 }).limit(500);
  res.json({ data });
}));

router.post('/marks', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['student', 'course', 'assessment', 'score', 'maxScore', 'remarks']);
  const { student, course, assessment, score, maxScore, remarks = '' } = req.body || {};
  if (!student || !course || !assessment || score === undefined || maxScore === undefined) throw new AppError(400, 'student, course, assessment, score, and maxScore are required.');
  if (Number(score) > Number(maxScore)) throw new AppError(400, 'score cannot exceed maxScore.');
  await ensureAssignedCourse(req.user, course);
  if (!(await User.exists({ _id: student, role: 'student', active: true }))) throw new AppError(400, 'A valid active student is required.');
  const data = await Mark.create({ student, course, assessment, score, maxScore, remarks, faculty: req.user._id });
  res.status(201).json({ data });
}));

router.patch('/marks/:id', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['assessment', 'score', 'maxScore', 'remarks']);
  const current = await Mark.findById(req.params.id);
  if (!current) throw new AppError(404, 'Mark record not found.');
  await ensureAssignedCourse(req.user, current.course);
  Object.assign(current, req.body);
  if (current.score > current.maxScore) throw new AppError(400, 'score cannot exceed maxScore.');
  await current.save();
  res.json({ data: current });
}));

router.delete('/marks/:id', allowRoles('admin', 'faculty'), asyncHandler(async (req, res) => {
  const current = await Mark.findById(req.params.id);
  if (!current) throw new AppError(404, 'Mark record not found.');
  await ensureAssignedCourse(req.user, current.course);
  await current.deleteOne();
  res.json({ data: current });
}));

router.get('/timetable', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'faculty') filter.faculty = req.user._id;
  if (req.user.role === 'student' && req.user.department) filter.department = req.user.department;
  const data = await Timetable.find(filter).populate('course', 'name code').populate('faculty', 'name').populate('department', 'name code').sort({ day: 1, startTime: 1 });
  res.json({ data });
}));

router.post('/timetable', allowRoles('admin'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['course', 'faculty', 'department', 'day', 'startTime', 'endTime', 'room']);
  if (Object.keys(req.body || {}).length !== 7) throw new AppError(400, 'All timetable fields are required.');
  if (req.body.startTime >= req.body.endTime) throw new AppError(400, 'endTime must be later than startTime.');
  await validateTimetableAssignments(req.body);
  const data = await Timetable.create(req.body);
  res.status(201).json({ data });
}));

router.patch('/timetable/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  rejectUnknown(req.body, ['course', 'faculty', 'department', 'day', 'startTime', 'endTime', 'room']);
  const current = await Timetable.findById(req.params.id);
  if (!current) throw new AppError(404, 'Timetable entry not found.');
  const update = { ...current.toObject(), ...req.body };
  if (update.startTime >= update.endTime) throw new AppError(400, 'endTime must be later than startTime.');
  await validateTimetableAssignments(update);
  Object.assign(current, req.body);
  await current.save();
  const data = current;
  res.json({ data });
}));

router.delete('/timetable/:id', allowRoles('admin'), asyncHandler(async (req, res) => {
  const data = await Timetable.findByIdAndDelete(req.params.id);
  if (!data) throw new AppError(404, 'Timetable entry not found.');
  res.json({ data });
}));

async function ensureAssignedCourse(user, courseId) {
  const course = await Course.findById(courseId).select('faculty');
  if (!course) throw new AppError(400, 'Course not found.');
  if (user.role === 'faculty' && !course.faculty.some((id) => id.equals(user._id))) {
    throw new AppError(403, 'Faculty can only manage records for assigned courses.');
  }
}

async function validateTimetableAssignments(entry) {
  const [course, faculty] = await Promise.all([
    Course.findById(entry.course).select('faculty department'),
    User.findOne({ _id: entry.faculty, role: 'faculty', active: true }).select('_id department')
  ]);
  if (!course) throw new AppError(400, 'A valid course is required.');
  if (!faculty) throw new AppError(400, 'An active faculty member is required.');
  if (!course.faculty.some((id) => id.equals(faculty._id))) {
    throw new AppError(400, 'The faculty member must be assigned to the selected course.');
  }
  if (!course.department.equals(entry.department) || !faculty.department?.equals(entry.department)) {
    throw new AppError(400, 'The course, faculty member, and timetable department must match.');
  }
}

function scopeCourseRecords(user, facultyRole) {
  return user.role === facultyRole ? { course: { $in: user.assignedCourses } } : {};
}

function rejectUnknown(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'A JSON object is required.');
  const unknown = Object.keys(body).find((key) => !allowed.includes(key));
  if (unknown) throw new AppError(400, `Unexpected field: ${unknown}`);
}

module.exports = router;
