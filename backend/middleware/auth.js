const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { isBlacklisted } = require('../utils/tokenBlacklist');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) throw new ApiError(401, 'Нэвтрээгүй байна. Нэвтэрнэ үү.');
  if (isBlacklisted(token)) throw new ApiError(401, 'Токен хүчингүй болсон. Дахин нэвтэрнэ үү.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) throw new ApiError(401, 'Хэрэглэгч олдсонгүй.');
    if (!user.isActive) throw new ApiError(403, 'Таны бүртгэл идэвхгүй болсон байна.');
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Токен хүчингүй байна.');
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, `'${req.user.role}' үүрэгтэй хэрэглэгчид энэ үйлдэл хийх эрх байхгүй.`);
  }
  next();
};

module.exports = { protect, authorize };
