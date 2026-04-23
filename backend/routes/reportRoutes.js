const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.use(protect, authorize('admin'));
router.get('/dashboard', ctrl.getDashboard);
router.get('/revenue', ctrl.getRevenue);
router.get('/appointments', ctrl.getAppointmentReport);
router.get('/top-doctors', ctrl.getTopDoctors);
router.get('/top-services', ctrl.getTopServices);

module.exports = router;
