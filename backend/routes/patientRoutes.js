const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/patientController');

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'receptionist'), ctrl.getPatients);
router.post('/', authorize('admin', 'receptionist'), ctrl.createPatient);
router.get('/:id', ctrl.getPatientById);
router.put('/:id', ctrl.updatePatient);
router.get('/:id/history', ctrl.getPatientHistory);
router.get('/:id/chart', ctrl.getPatientChart);

module.exports = router;
