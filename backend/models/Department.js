const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 12, unique: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
