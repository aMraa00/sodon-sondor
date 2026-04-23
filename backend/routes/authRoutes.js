const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: '15 минутанд хэт олон хүсэлт илгээлээ. Түр хүлээнэ үү.' } });

router.post('/register', limiter, ctrl.register);
router.post('/login', limiter, ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.get('/me', protect, ctrl.getMe);
router.put('/change-password', protect, ctrl.changePassword);
router.post('/forgot-password', limiter, ctrl.forgotPassword);
router.put('/reset-password/:token', ctrl.resetPassword);

module.exports = router;
