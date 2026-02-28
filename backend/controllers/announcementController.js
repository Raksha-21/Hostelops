const Announcement = require('../models/Announcement');

exports.create = async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;
    const ann = await Announcement.create({ title, message, type, expiresAt, author: req.user._id, authorName: req.user.name });
    res.status(201).json({ announcement: ann });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const anns = await Announcement.find({ isActive: true }).sort('-createdAt').limit(10);
    res.json({ announcements: anns });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
