const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 20, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    credits: { type: Number, min: 1, max: 12, default: 3 },
    semester: { type: Number, min: 1, max: 12, required: true },
    description: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
