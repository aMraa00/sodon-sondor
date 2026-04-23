const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/pagination');
const { format, addMinutes, parseISO, startOfMonth, endOfMonth } = require('date-fns');

const emitNotification = (io, recipientId, payload) => {
  if (io) io.to(`user:${recipientId}`).emit('notification:new', payload);
};

exports.getAppointments = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  let filter = {};

  if (role === 'patient') filter.patient = _id;
  else if (role === 'doctor') filter.doctor = _id;
  else if (role === 'receptionist') { /* бүгдийг харна */ }
  // admin бүгдийг харна

  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const d = new Date(req.query.date);
    filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
  }

  const result = await paginate(
    Appointment,
    filter,
    req.query,
    [{ path: 'patient', select: 'firstName lastName avatar' },
     { path: 'doctor', select: 'firstName lastName avatar' },
     { path: 'service', select: 'name price duration' }]
  );

  res.json({ success: true, ...result });
});

exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('patient', 'firstName lastName phone email avatar')
    .populate('doctor', 'firstName lastName avatar')
    .populate('service', 'name price duration');

  if (!appt) throw new ApiError(404, 'Цаг захиалга олдсонгүй.');

  const { role, _id } = req.user;
  const isOwner = appt.patient._id.equals(_id) || appt.doctor._id.equals(_id);
  if (role === 'patient' && !isOwner) throw new ApiError(403, 'Энэ цаг захиалгыг харах эрх байхгүй.');

  res.json({ success: true, data: appt });
});

exports.createAppointment = asyncHandler(async (req, res) => {
  const { doctor, service, date, startTime, endTime, notes } = req.body;
  const patientId = req.user.role === 'patient' ? req.user._id : req.body.patient;

  // Давхцал шалгах
  const conflict = await Appointment.findOne({
    doctor,
    date: new Date(date),
    startTime,
    status: { $nin: ['cancelled', 'no-show'] },
  });
  if (conflict) throw new ApiError(409, 'Тухайн цаг аль хэдийн захиалагдсан байна.');

  const appt = await Appointment.create({ patient: patientId, doctor, service, date, startTime, endTime, notes });

  const io = req.app.get('io');
  const notifPayload = { title: 'Шинэ цаг захиалга', message: `${startTime} цагт цаг захиалга ирлээ.`, type: 'appointment', link: `/appointments/${appt._id}` };
  await Notification.create({ recipient: doctor, ...notifPayload });
  emitNotification(io, doctor, notifPayload);
  io?.emit('appointment:created', { appointmentId: appt._id, doctor, date, startTime });

  res.status(201).json({ success: true, data: appt, message: 'Цаг захиалга амжилттай үүслээ.' });
});

exports.updateAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Цаг захиалга олдсонгүй.');

  const { role, _id } = req.user;
  const isOwner = appt.patient.equals(_id);
  if (role === 'patient' && !isOwner) throw new ApiError(403, 'Эрх байхгүй.');

  const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  const io = req.app.get('io');
  io?.emit('appointment:updated', { appointmentId: updated._id });

  res.json({ success: true, data: updated });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Цаг захиалга олдсонгүй.');

  appt.status = status;
  if (cancelReason) appt.cancelReason = cancelReason;
  if (status === 'confirmed') { appt.confirmedBy = req.user._id; appt.confirmedAt = new Date(); }
  if (status === 'completed') appt.completedAt = new Date();
  await appt.save();

  const io = req.app.get('io');
  const notif = { title: 'Цаг захиалгын мэдэгдэл', message: `Таны цаг захиалга ${status === 'confirmed' ? 'батлагдлаа' : status === 'cancelled' ? 'цуцлагдлаа' : 'дуусгавар боллоо'}.`, type: 'appointment', link: `/appointments/${appt._id}` };
  await Notification.create({ recipient: appt.patient, ...notif });
  emitNotification(io, appt.patient.toString(), notif);
  io?.emit('appointment:updated', { appointmentId: appt._id, status });

  res.json({ success: true, data: appt, message: 'Төлөв шинэчлэгдлээ.' });
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Цаг захиалга олдсонгүй.');

  const { role, _id } = req.user;
  if (role === 'patient' && !appt.patient.equals(_id)) throw new ApiError(403, 'Эрх байхгүй.');

  await appt.deleteOne();
  res.json({ success: true, message: 'Цаг захиалга устгагдлаа.' });
});

exports.getCalendar = asyncHandler(async (req, res) => {
  const { month } = req.query; // "2026-04"
  const start = month ? startOfMonth(parseISO(`${month}-01`)) : startOfMonth(new Date());
  const end = endOfMonth(start);

  const { role, _id } = req.user;
  let filter = { date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } };
  if (role === 'doctor') filter.doctor = _id;
  else if (role === 'patient') filter.patient = _id;

  const appointments = await Appointment.find(filter)
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName')
    .populate('service', 'name')
    .sort('date startTime');

  res.json({ success: true, data: appointments });
});

exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { id: doctorUserId } = req.params;
  if (!date) throw new ApiError(400, 'Огноо оруулна уу.');

  const doctor = await Doctor.findOne({ user: doctorUserId });
  if (!doctor) throw new ApiError(404, 'Эмч олдсонгүй.');

  const d = new Date(date);
  const dow = d.getDay();
  const daySchedule = doctor.schedule.find((s) => s.dayOfWeek === dow && s.isWorking);

  if (!daySchedule) return res.json({ success: true, data: [], message: 'Тухайн өдөр ажлын өдөр биш.' });

  const booked = await Appointment.find({
    doctor: doctorUserId,
    date: { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(new Date(date).setHours(23,59,59,999)) },
    status: { $nin: ['cancelled', 'no-show'] },
  }).select('startTime endTime');

  const bookedTimes = new Set(booked.map((a) => a.startTime));
  const slots = [];
  let current = daySchedule.startTime;

  while (current < daySchedule.endTime) {
    const [h, m] = current.split(':').map(Number);
    const next = format(addMinutes(new Date().setHours(h, m, 0, 0), daySchedule.slotDuration), 'HH:mm');
    slots.push({ time: current, isBooked: bookedTimes.has(current), endTime: next });
    current = next;
  }

  res.json({ success: true, data: slots });
});
