const DentalChart = require('../models/DentalChart');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getChart = asyncHandler(async (req, res) => {
  let chart = await DentalChart.findOne({ patient: req.params.patientId })
    .populate('examDoctor', 'firstName lastName');
  if (!chart) chart = await DentalChart.create({ patient: req.params.patientId, teeth: [] });
  res.json({ success: true, data: chart });
});

exports.upsertChart = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { teeth, notes } = req.body;

  const chart = await DentalChart.findOneAndUpdate(
    { patient: patientId },
    { teeth, notes, lastExamDate: new Date(), examDoctor: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: chart });
});

exports.updateTooth = asyncHandler(async (req, res) => {
  const { patientId, toothNumber } = req.params;
  const { status, surfaces, notes } = req.body;

  let chart = await DentalChart.findOne({ patient: patientId });
  if (!chart) chart = await DentalChart.create({ patient: patientId, teeth: [] });

  const idx = chart.teeth.findIndex((t) => t.toothNumber === parseInt(toothNumber));
  const toothData = { toothNumber: parseInt(toothNumber), status, surfaces, notes, lastUpdated: new Date(), updatedBy: req.user._id };

  if (idx >= 0) chart.teeth[idx] = toothData;
  else chart.teeth.push(toothData);

  chart.lastExamDate = new Date();
  chart.examDoctor = req.user._id;
  await chart.save();

  res.json({ success: true, data: chart });
});
