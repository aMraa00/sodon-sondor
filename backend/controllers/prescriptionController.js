const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.createPrescription = asyncHandler(async (req, res) => {
  const rx = await Prescription.create({ ...req.body, doctor: req.user._id });
  res.status(201).json({ success: true, data: rx });
});

exports.getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  if (role === 'patient' && !_id.equals(req.params.id)) throw new ApiError(403, 'Эрх байхгүй.');

  const rxs = await Prescription.find({ patient: req.params.id })
    .populate('doctor', 'firstName lastName')
    .populate('diagnosis', 'title')
    .sort('-createdAt');
  res.json({ success: true, data: rxs });
});
