const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { addToBlacklist } = require('../utils/tokenBlacklist');
const emailService = require('../services/emailService');

const signToken = (id, secret, expire) =>
  jwt.sign({ id }, secret, { expiresIn: expire });

const sendTokens = (user, statusCode, res) => {
  const token = signToken(user._id, process.env.JWT_SECRET, process.env.JWT_EXPIRE);
  const refreshToken = signToken(user._id, process.env.REFRESH_SECRET, process.env.REFRESH_EXPIRE);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;
  const safeRole = ['patient'].includes(role) ? role : 'patient';

  const user = await User.create({ firstName, lastName, email, phone, password, role: safeRole });

  if (safeRole === 'patient') {
    await Patient.create({ user: user._id });
  }

  sendTokens(user, 201, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Имэйл болон нууц үг оруулна уу.');

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Имэйл эсвэл нууц үг буруу байна.');
  }
  if (!user.isActive) throw new ApiError(403, 'Таны бүртгэл идэвхгүй болсон байна.');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokens(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  addToBlacklist(req.token);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Амжилттай гарлаа.' });
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, 'Refresh токен байхгүй байна.');

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'Хэрэглэгч олдсонгүй.');

  const token = signToken(user._id, process.env.JWT_SECRET, process.env.JWT_EXPIRE);
  res.json({ success: true, token });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(400, 'Одоогийн нууц үг буруу байна.');
  }
  user.password = newPassword;
  await user.save();
  sendTokens(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, 'Энэ имэйлтэй хэрэглэгч олдсонгүй.');

  const token = crypto.randomBytes(20).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await emailService.sendPasswordReset(user.email, user.firstName, resetUrl);

  res.json({ success: true, message: 'Нууц үг сэргээх линк имэйлээр илгээгдлээ.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Токен хүчингүй эсвэл хугацаа дууссан байна.');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokens(user, 200, res);
});
