const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessment: { type: String, required: true, trim: true, maxlength: 100 },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    remarks: { type: String, trim: true, maxlength: 250, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mark', markSchema);
