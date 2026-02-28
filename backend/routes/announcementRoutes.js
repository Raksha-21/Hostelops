const router = require('express').Router();
const ctrl = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, ctrl.getAll);
router.post('/', protect, adminOnly, ctrl.create);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
