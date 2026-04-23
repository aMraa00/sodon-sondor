const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.use(protect);
router.get('/', authorize('admin'), ctrl.getUsers);
router.post('/', authorize('admin'), ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', authorize('admin'), ctrl.deleteUser);
router.patch('/:id/status', authorize('admin'), ctrl.toggleStatus);

module.exports = router;
