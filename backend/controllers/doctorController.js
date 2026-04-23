const User = require('../models/User');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ isAvailable: true })
    .populate('user', 'firstName lastName email phone avatar')
    .sort('-rating');
  res.json({ success: true, data: doctors });
});

exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.params.id })
    .populate('user', 'firstName lastName email phone avatar');
  if (!doctor) throw new ApiError(404, 'Эмч олдсонгүй.');
  res.json({ success: true, data: doctor });
});

exports.getDoctorSchedule = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.params.id }).select('schedule vacationDates');
  if (!doctor) throw new ApiError(404, 'Эмч олдсонгүй.');
  res.json({ success: true, data: doctor });
});

exports.createDoctor = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, specialization, licenseNumber, experience, bio, consultationFee, schedule } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Энэ имэйл аль хэдийн бүртгэлтэй байна.');

  const user = await User.create({ firstName, lastName, email, phone, password: password || 'Doctor@123', role: 'doctor' });
  const doctor = await Doctor.create({ user: user._id, specialization, licenseNumber, experience, bio, consultationFee, schedule });

  res.status(201).json({ success: true, data: { user, doctor }, message: 'Эмч амжилттай бүртгэгдлээ.' });
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  const { id } = req.params;

  const doctorRecord = await Doctor.findOne({ user: id });
  if (!doctorRecord) throw new ApiError(404, 'Эмч олдсонгүй.');
  if (role === 'doctor' && !doctorRecord.user.equals(_id)) throw new ApiError(403, 'Эрх байхгүй.');

  const { firstName, lastName, phone, avatar, ...doctorFields } = req.body;
  await User.findByIdAndUpdate(id, { firstName, lastName, phone, avatar }, { new: true });
  const updated = await Doctor.findOneAndUpdate({ user: id }, doctorFields, { new: true, runValidators: true });

  res.json({ success: true, data: updated });
});
