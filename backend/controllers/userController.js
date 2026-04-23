const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/pagination');

exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const result = await paginate(User, filter, req.query);
  res.json({ success: true, ...result });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && !req.user._id.equals(id)) {
    throw new ApiError(403, 'Эрх байхгүй.');
  }
  const disallowed = ['password', 'role', 'email'];
  if (req.user.role !== 'admin') disallowed.forEach((f) => delete req.body[f]);

  const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'Хэрэглэгч олдсонгүй.');
  res.json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw new ApiError(404, 'Хэрэглэгч олдсонгүй.');
  res.json({ success: true, message: 'Хэрэглэгч идэвхгүй болголоо.' });
});

exports.toggleStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Хэрэглэгч олдсонгүй.');
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user, message: `Хэрэглэгч ${user.isActive ? 'идэвхжлээ' : 'идэвхгүй болголоо'}.` });
});
