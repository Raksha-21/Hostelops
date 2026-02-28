const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:{ type: String },
  authorRole:{ type: String },
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName:  { type: String },
  studentRoom:  { type: String },
  studentBlock: { type: String },

  title:       { type: String, required: true, trim: true },
  category:    { type: String, enum: ['Electrical','Plumbing','Furniture','Cleaning','Network','Security','Pest Control','Water Supply','Other'], required: true },
  description: { type: String, required: true },
  priority:    { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Medium' },
  location:    { type: String },

  status:      { type: String, enum: ['Pending','In Progress','Resolved','Rejected','On Hold'], default: 'Pending' },
  assignedTo:  { type: String, default: '' },
  adminNote:   { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  expectedResolution: { type: Date },
  resolvedAt:  { type: Date },

  // New features
  images:      [{ type: String }],
  upvotes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating:      { type: Number, min: 1, max: 5 },
  ratingNote:  { type: String },
  comments:    [commentSchema],
  views:       { type: Number, default: 0 },
  isPublic:    { type: Boolean, default: true },
  tags:        [{ type: String }],
}, { timestamps: true });

complaintSchema.index({ student: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
