const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/appointmentController');

router.use(protect);
router.get('/calendar', ctrl.getCalendar);
router.get('/', ctrl.getAppointments);
router.post('/', ctrl.createAppointment);
router.get('/:id', ctrl.getAppointmentById);
router.put('/:id', ctrl.updateAppointment);
router.patch('/:id/status', authorize('admin', 'doctor', 'receptionist'), ctrl.updateStatus);
router.delete('/:id', ctrl.deleteAppointment);

module.exports = router;
