const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getServices = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const services = await Service.find(filter).sort('category name');
  res.json({ success: true, data: services });
});

exports.createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: service });
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) throw new ApiError(404, 'Үйлчилгээ олдсонгүй.');
  res.json({ success: true, data: service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) throw new ApiError(404, 'Үйлчилгээ олдсонгүй.');
  res.json({ success: true, message: 'Үйлчилгээ идэвхгүй болголоо.' });
});
