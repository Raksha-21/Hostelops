const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define Schemas manually to avoid module loading differences, or require them if available.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  roomNumber: { type: String },
  hostelBlock: { type: String },
  phone: { type: String },
  notifications: [{
    message: String,
    type: { type: String, default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentRoom: { type: String, required: true },
  studentBlock: { type: String },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'On Hold'], default: 'Pending' },
  assignedTo: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, min: 1, max: 5 },
  ratingNote: { type: String },
  location: { type: String },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    authorRole: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date }
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'urgent', 'maintenance'], default: 'info' },
  authorName: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);


async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostelops';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Announcement.deleteMany({});

    console.log('Seeding Users...');
    const hashedPwdStudent = await bcrypt.hash('123456', 10);
    const hashedPwdAdmin = await bcrypt.hash('admin123', 10);

    const users = await User.insertMany([
      { name: 'Rahul Kumar', email: 'student@hostel.com', password: hashedPwdStudent, role: 'student', roomNumber: 'A-101', hostelBlock: 'Block A', phone: '9876543210' },
      { name: 'Priya Sharma', email: 'priya@hostel.com', password: hashedPwdStudent, role: 'student', roomNumber: 'B-204', hostelBlock: 'Block B', phone: '9876543211' },
      { name: 'Admin Kumar', email: 'admin@hostel.com', password: hashedPwdAdmin, role: 'admin', roomNumber: '', hostelBlock: '', phone: '' },
      { name: 'Amit Singh', email: 'amit@hostel.com', password: hashedPwdStudent, role: 'student', roomNumber: 'C-301', hostelBlock: 'Block C', phone: '9876543212' },
      { name: 'Sneha Patel', email: 'sneha@hostel.com', password: hashedPwdStudent, role: 'student', roomNumber: 'D-102', hostelBlock: 'Block D', phone: '9876543213' }
    ]);

    const u1 = users[0]._id;
    const u2 = users[1]._id;
    // const u3 = users[2]._id; // Admin
    const u4 = users[3]._id;
    const u5 = users[4]._id;

    console.log('Seeding Complaints...');
    await Complaint.insertMany([
      { student: u1, studentName: 'Rahul Kumar', studentRoom: 'A-101', studentBlock: 'Block A', title: 'Ceiling fan not working in room', category: 'Electrical', description: 'The ceiling fan has completely stopped working since 2 days. Switch is on but the fan is not rotating at all. Room is extremely hot.', priority: 'High', status: 'In Progress', assignedTo: 'Electrician Team A', adminNote: 'Electrician will visit tomorrow 10 AM. Issue is likely a capacitor failure.', upvotes: [u2, u4], isPublic: true },
      { student: u2, studentName: 'Priya Sharma', studentRoom: 'B-204', studentBlock: 'Block B', title: 'Continuous water leakage from tap', category: 'Plumbing', description: 'The bathroom tap is continuously dripping water. The entire floor stays wet. This is wasting water and causing slip hazard.', priority: 'Medium', status: 'Pending', upvotes: [u1, u4, u5], isPublic: true },
      { student: u4, studentName: 'Amit Singh', studentRoom: 'C-301', studentBlock: 'Block C', title: 'Study chair completely broken', category: 'Furniture', description: 'The study chair leg has snapped off. It is dangerous to sit on. I am unable to study properly. Need replacement urgently.', priority: 'Urgent', status: 'Pending', upvotes: [], isPublic: true },
      { student: u1, studentName: 'Rahul Kumar', studentRoom: 'A-101', studentBlock: 'Block A', title: 'WiFi speed below 1 Mbps', category: 'Network', description: 'WiFi signal is extremely weak and unusable. I cannot attend online classes or submit assignments. Been like this for 3 days.', priority: 'High', status: 'Resolved', assignedTo: 'Network Team', adminNote: 'Router reset and signal booster installed near Block A. Issue resolved.', rating: 4, ratingNote: 'Good response time but took 2 days.', upvotes: [u2], isPublic: true },
      { student: u2, studentName: 'Priya Sharma', studentRoom: 'B-204', studentBlock: 'Block B', title: 'Flickering room light', category: 'Electrical', description: 'Main room light flickers every few minutes. Very disturbing during night study hours. Already complained verbally 3 times.', priority: 'Medium', status: 'Resolved', assignedTo: 'Electrician Team B', adminNote: 'Replaced faulty bulb holder and wiring connection. All working fine now.', rating: 5, ratingNote: 'Excellent service! Fixed same day.', upvotes: [], isPublic: true }
    ]);

    console.log('Seeding Announcements...');
    await Announcement.insertMany([
      { title: 'Water Supply Disruption', message: 'Water supply will be disrupted on Sunday 10 AM - 2 PM for maintenance of the main pipeline. Please store water in advance.', type: 'maintenance', authorName: 'Admin Kumar', isActive: true },
      { title: 'Electricity Maintenance Schedule', message: 'Block B and C will face scheduled power outage on Saturday 6-8 AM for transformer maintenance. We apologize for inconvenience.', type: 'warning', authorName: 'Admin Kumar', isActive: true },
      { title: 'New Complaint Portal Live', message: 'We have launched the new HostelOps digital complaint system. Please use this portal to submit all maintenance complaints going forward.', type: 'info', authorName: 'Admin Kumar', isActive: true }
    ]);

    console.log('✅ Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
