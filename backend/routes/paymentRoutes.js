const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

router.use(protect);
router.post('/', authorize('admin', 'receptionist'), ctrl.createPayment);
router.get('/', authorize('admin', 'receptionist'), ctrl.getPayments);
router.get('/patient/:id', ctrl.getPaymentsByPatient);
router.post('/:id/invoice', ctrl.generateInvoice);

module.exports = router;
