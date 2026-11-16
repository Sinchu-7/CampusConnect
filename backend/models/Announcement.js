const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    audience: [{ type: String, enum: ['admin', 'student', 'faculty'] }],
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
