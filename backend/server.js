const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() }));

// Seed default admin (first run only)
async function seedAdmin() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  const exists = await User.findOne({ email: 'admin@hostel.com' });
  if (!exists) {
    await User.create({
      name: 'Admin User', email: 'admin@hostel.com',
      password: await bcrypt.hash('admin123', 12), role: 'admin'
    });
    console.log('✅ Default admin created: admin@hostel.com / admin123');
  }
  const student = await User.findOne({ email: 'student@hostel.com' });
  if (!student) {
    await User.create({
      name: 'Rahul Kumar', email: 'student@hostel.com',
      password: await bcrypt.hash('123456', 12), role: 'student',
      roomNumber: 'A-101', hostelBlock: 'Block A', phone: '9876543210'
    });
    console.log('✅ Demo student created: student@hostel.com / 123456');
  }
}

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostelops')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await seedAdmin();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection failed:', err.message); process.exit(1); });
