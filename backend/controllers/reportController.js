const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const [totalPatients, todayAppts, monthRevenue, activeDoctors] = await Promise.all([
    User.countDocuments({ role: 'patient', isActive: true }),
    Appointment.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
    Payment.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    User.countDocuments({ role: 'doctor', isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      totalPatients,
      todayAppointments: todayAppts,
      monthRevenue: monthRevenue[0]?.total || 0,
      activeDoctors,
    },
  });
});

exports.getRevenue = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(req.query.to) : new Date();

  const data = await Payment.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        total: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data });
});

exports.getAppointmentReport = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(req.query.to) : new Date();

  const data = await Appointment.aggregate([
    { $match: { date: { $gte: from, $lte: to } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, data });
});

exports.getTopDoctors = asyncHandler(async (req, res) => {
  const data = await Appointment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: '$doctor' },
    { $project: { count: 1, 'doctor.firstName': 1, 'doctor.lastName': 1, 'doctor.avatar': 1 } },
  ]);
  res.json({ success: true, data });
});

exports.getTopServices = asyncHandler(async (req, res) => {
  const data = await Appointment.aggregate([
    { $match: { status: { $in: ['completed', 'confirmed'] } } },
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
    { $unwind: '$service' },
    { $project: { count: 1, 'service.name': 1, 'service.price': 1 } },
  ]);
  res.json({ success: true, data });
});
