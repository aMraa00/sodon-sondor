const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/prescriptionController');

router.use(protect);
router.post('/', authorize('doctor'), ctrl.createPrescription);
router.get('/patient/:id', ctrl.getPrescriptionsByPatient);

module.exports = router;
