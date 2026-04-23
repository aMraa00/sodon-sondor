const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/serviceController');

router.get('/', ctrl.getServices);
router.post('/', protect, authorize('admin'), ctrl.createService);
router.put('/:id', protect, authorize('admin'), ctrl.updateService);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteService);

module.exports = router;
