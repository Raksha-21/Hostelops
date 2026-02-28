const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Helper to push notification to user
async function notify(userId, message, type = 'info') {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { message, type, createdAt: new Date() } }
  });
}

// Student: Create complaint
exports.create = async (req, res) => {
  try {
    const { title, category, description, priority, location, tags, isPublic } = req.body;
    if (!title || !category || !description) return res.status(400).json({ message: 'Title, category and description required' });
    const complaint = await Complaint.create({
      student: req.user._id,
      studentName: req.user.name,
      studentRoom: req.user.roomNumber,
      studentBlock: req.user.hostelBlock,
      title, category, description, priority, location,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    res.status(201).json({ complaint });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student: Get my complaints
exports.getMine = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = { student: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    const complaints = await Complaint.find(filter).sort('-createdAt');
    res.json({ complaints });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin: Get all complaints
exports.getAll = async (req, res) => {
  try {
    const { status, category, priority, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { studentName: { $regex: search, $options: 'i' } },
    ];
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json({ complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin: Update complaint
exports.update = async (req, res) => {
  try {
    const { status, adminNote, assignedTo, expectedResolution, rejectionReason } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldStatus = complaint.status;
    complaint.status = status || complaint.status;
    complaint.adminNote = adminNote || complaint.adminNote;
    complaint.assignedTo = assignedTo !== undefined ? assignedTo : complaint.assignedTo;
    if (expectedResolution) complaint.expectedResolution = expectedResolution;
    if (rejectionReason) complaint.rejectionReason = rejectionReason;
    if (status === 'Resolved' && !complaint.resolvedAt) complaint.resolvedAt = new Date();

    await complaint.save();

    // Notify student
    if (oldStatus !== complaint.status) {
      const msg = `Your complaint "${complaint.title}" status changed to ${complaint.status}`;
      await notify(complaint.student, msg, complaint.status === 'Resolved' ? 'success' : 'info');
    }

    res.json({ complaint });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Upvote toggle
exports.upvote = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.student.toString() === req.user._id.toString())
      return res.status(400).json({ message: "Can't upvote your own complaint" });
    const idx = complaint.upvotes.indexOf(req.user._id);
    if (idx === -1) complaint.upvotes.push(req.user._id);
    else complaint.upvotes.splice(idx, 1);
    await complaint.save();
    res.json({ upvotes: complaint.upvotes.length, upvoted: idx === -1 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Rate complaint
exports.rate = async (req, res) => {
  try {
    const { rating, ratingNote } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id, status: 'Resolved' },
      { rating, ratingNote },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: 'Not found or not resolved yet' });
    res.json({ complaint });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    complaint.comments.push({
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      text
    });
    await complaint.save();
    res.json({ comments: complaint.comments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Stats
exports.getStats = async (req, res) => {
  try {
    const all = await Complaint.find();
    const byCategory = await Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const byStatus = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byPriority = await Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]);
    const rated = all.filter(c => c.rating);
    const avgRating = rated.length ? (rated.reduce((s, c) => s + c.rating, 0) / rated.length).toFixed(1) : 0;
    const resolved = all.filter(c => c.status === 'Resolved' && c.resolvedAt);
    const avgResolutionHrs = resolved.length
      ? (resolved.reduce((s, c) => s + (new Date(c.resolvedAt) - new Date(c.createdAt)), 0) / resolved.length / 3600000).toFixed(1)
      : 0;
    res.json({
      total: all.length,
      pending: all.filter(c => c.status === 'Pending').length,
      inProgress: all.filter(c => c.status === 'In Progress').length,
      resolved: all.filter(c => c.status === 'Resolved').length,
      rejected: all.filter(c => c.status === 'Rejected').length,
      onHold: all.filter(c => c.status === 'On Hold').length,
      urgent: all.filter(c => c.priority === 'Urgent' && c.status !== 'Resolved').length,
      avgRating, avgResolutionHrs,
      byCategory, byStatus, byPriority,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete (admin)
exports.remove = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
