const Diagnosis = require('../models/Diagnosis');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.createDiagnosis = asyncHandler(async (req, res) => {
  const diagnosis = await Diagnosis.create({ ...req.body, doctor: req.user._id });
  res.status(201).json({ success: true, data: diagnosis });
});

exports.getDiagnosesByPatient = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  if (role === 'patient' && !_id.equals(req.params.id)) throw new ApiError(403, 'Эрх байхгүй.');

  const diagnoses = await Diagnosis.find({ patient: req.params.id })
    .populate('doctor', 'firstName lastName')
    .populate('appointment', 'date startTime')
    .sort('-createdAt');
  res.json({ success: true, data: diagnoses });
});

exports.updateDiagnosis = asyncHandler(async (req, res) => {
  const diag = await Diagnosis.findById(req.params.id);
  if (!diag) throw new ApiError(404, 'Оношлогоо олдсонгүй.');
  if (!diag.doctor.equals(req.user._id)) throw new ApiError(403, 'Зөвхөн оношлогоо бичсэн эмч засварлаж болно.');

  const updated = await Diagnosis.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
});
