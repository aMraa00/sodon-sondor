const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const apptCtrl = require('../controllers/appointmentController');
const doctorCtrl = require('../controllers/doctorController');

router.get('/', doctorCtrl.getDoctors);
router.get('/:id', doctorCtrl.getDoctorById);
router.get('/:id/schedule', doctorCtrl.getDoctorSchedule);
router.get('/:id/slots', apptCtrl.getAvailableSlots);
router.post('/', protect, authorize('admin'), doctorCtrl.createDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), doctorCtrl.updateDoctor);

module.exports = router;
