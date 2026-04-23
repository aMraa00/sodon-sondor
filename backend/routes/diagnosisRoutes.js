const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/diagnosisController');

router.use(protect);
router.post('/', authorize('doctor'), ctrl.createDiagnosis);
router.get('/patient/:id', ctrl.getDiagnosesByPatient);
router.put('/:id', authorize('doctor'), ctrl.updateDiagnosis);

module.exports = router;
