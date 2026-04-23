const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/dentalChartController');

router.use(protect);
router.get('/:patientId', ctrl.getChart);
router.put('/:patientId', authorize('doctor'), ctrl.upsertChart);
router.patch('/:patientId/tooth/:toothNumber', authorize('doctor'), ctrl.updateTooth);

module.exports = router;
