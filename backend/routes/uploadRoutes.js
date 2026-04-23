const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

router.post('/avatar', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Файл сонгогдоогүй байна.' });
  const url = `/uploads/avatars/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { avatar: url });
  res.json({ success: true, data: { url }, message: 'Профайл зураг шинэчлэгдлээ.' });
}));

router.post('/xray', protect, upload.single('xray'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Файл сонгогдоогүй байна.' });
  const url = `/uploads/xrays/${req.file.filename}`;
  res.json({ success: true, data: { url } });
}));

module.exports = router;
