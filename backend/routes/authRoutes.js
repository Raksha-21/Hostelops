const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.put('/profile', protect, ctrl.updateProfile);
router.get('/notifications', protect, ctrl.getNotifications);
router.put('/notifications/read', protect, ctrl.markNotificationsRead);
router.get('/users', protect, adminOnly, ctrl.getAllUsers);

module.exports = router;
