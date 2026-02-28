const router = require('express').Router();
const ctrl = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, ctrl.create);
router.get('/my', protect, ctrl.getMine);
router.get('/stats', protect, adminOnly, ctrl.getStats);
router.get('/', protect, adminOnly, ctrl.getAll);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);
router.post('/:id/upvote', protect, ctrl.upvote);
router.post('/:id/rate', protect, ctrl.rate);
router.post('/:id/comment', protect, ctrl.addComment);

module.exports = router;
