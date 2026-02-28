const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['info','warning','maintenance','urgent'], default: 'info' },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName:{ type: String },
  isActive:  { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
