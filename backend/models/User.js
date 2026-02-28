const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true, minlength: 6 },
  role:        { type: String, enum: ['student', 'admin'], default: 'student' },
  roomNumber:  { type: String, trim: true },
  hostelBlock: { type: String, trim: true },
  phone:       { type: String, trim: true },
  avatar:      { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  lastLogin:   { type: Date },
  notifications: [{
    message:   { type: String },
    type:      { type: String, enum: ['info','success','warning','error'], default: 'info' },
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
