const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, roomNumber, hostelBlock, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, roomNumber, hostelBlock, phone });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role, roomNumber, hostelBlock } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, roomNumber: user.roomNumber, hostelBlock: user.hostelBlock, phone: user.phone } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, roomNumber, hostelBlock } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, roomNumber, hostelBlock }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('-password').sort('-createdAt');
    res.json({ users });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
