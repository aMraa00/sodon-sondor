const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
