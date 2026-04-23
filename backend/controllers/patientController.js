const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Diagnosis = require('../models/Diagnosis');
const Prescription = require('../models/Prescription');
const DentalChart = require('../models/DentalChart');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/pagination');

exports.getPatients = asyncHandler(async (req, res) => {
  const { search, gender, page, limit, sort } = req.query;
  const userFilter = { role: 'patient', isActive: true };

  if (search) {
    userFilter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (gender) userFilter.gender = gender;

  const users = await User.find(userFilter).select('-password').sort(sort || '-createdAt')
    .skip(((page || 1) - 1) * (limit || 20)).limit(parseInt(limit) || 20);

  const total = await User.countDocuments(userFilter);
  const userIds = users.map((u) => u._id);
  const patientRecords = await Patient.find({ user: { $in: userIds } });
  const patientMap = {};
  patientRecords.forEach((p) => { patientMap[p.user.toString()] = p; });

  const data = users.map((u) => ({ ...u.toJSON(), patientRecord: patientMap[u._id.toString()] || null }));

  res.json({ success: true, data, pagination: { page: parseInt(page) || 1, limit: parseInt(limit) || 20, total, totalPages: Math.ceil(total / (parseInt(limit) || 20)) } });
});

exports.getPatientById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'patient') throw new ApiError(404, 'Өвчтөн олдсонгүй.');

  const { role, _id } = req.user;
  if (role === 'patient' && !user._id.equals(_id)) throw new ApiError(403, 'Эрх байхгүй.');

  const patientRecord = await Patient.findOne({ user: user._id });
  res.json({ success: true, data: { ...user.toJSON(), patientRecord } });
});

exports.createPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, gender, dateOfBirth, address, ...patientData } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Энэ имэйл аль хэдийн бүртгэлтэй байна.');

  const user = await User.create({ firstName, lastName, email, phone, password: password || 'Patient@123', role: 'patient', gender, dateOfBirth, address });
  const patient = await Patient.create({ user: user._id, registeredBy: req.user._id, ...patientData });

  res.status(201).json({ success: true, data: { ...user.toJSON(), patientRecord: patient }, message: 'Өвчтөн амжилттай бүртгэгдлээ.' });
});

exports.updatePatient = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'Өвчтөн олдсонгүй.');
  if (role === 'patient' && !user._id.equals(_id)) throw new ApiError(403, 'Эрх байхгүй.');

  const { allergies, bloodType, emergencyContact, medicalHistory, insuranceNumber, notes, ...userFields } = req.body;
  const allowedUserFields = ['firstName', 'lastName', 'phone', 'gender', 'dateOfBirth', 'address', 'avatar'];
  const userUpdate = {};
  allowedUserFields.forEach((f) => { if (userFields[f] !== undefined) userUpdate[f] = userFields[f]; });

  const updatedUser = await User.findByIdAndUpdate(id, userUpdate, { new: true, runValidators: true });
  const updatedPatient = await Patient.findOneAndUpdate({ user: id }, { allergies, bloodType, emergencyContact, medicalHistory, insuranceNumber, notes }, { new: true, upsert: true });

  res.json({ success: true, data: { ...updatedUser.toJSON(), patientRecord: updatedPatient } });
});

exports.getPatientHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id } = req.user;
  if (role === 'patient' && !_id.equals(id)) throw new ApiError(403, 'Эрх байхгүй.');

  const [appointments, diagnoses, prescriptions] = await Promise.all([
    Appointment.find({ patient: id }).populate('doctor', 'firstName lastName').populate('service', 'name').sort('-date').limit(20),
    Diagnosis.find({ patient: id }).populate('doctor', 'firstName lastName').sort('-createdAt').limit(20),
    Prescription.find({ patient: id }).populate('doctor', 'firstName lastName').sort('-createdAt').limit(10),
  ]);

  res.json({ success: true, data: { appointments, diagnoses, prescriptions } });
});

exports.getPatientChart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id } = req.user;
  if (role === 'patient' && !_id.equals(id)) throw new ApiError(403, 'Эрх байхгүй.');

  let chart = await DentalChart.findOne({ patient: id }).populate('examDoctor', 'firstName lastName');
  if (!chart) {
    chart = await DentalChart.create({ patient: id, teeth: [] });
  }

  res.json({ success: true, data: chart });
});
