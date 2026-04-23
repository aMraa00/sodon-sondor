const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/pagination');
const PDFDocument = require('pdfkit');

exports.createPayment = asyncHandler(async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();
  try {
    const { appointment: apptId, services, method, discount = 0, tax = 0, notes } = req.body;
    const subtotal = services.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    const total = subtotal - discount + tax;

    const payment = await Payment.create([{
      patient: req.body.patient,
      appointment: apptId,
      services,
      subtotal,
      discount,
      tax,
      total,
      method,
      status: 'paid',
      paidAt: new Date(),
      collectedBy: req.user._id,
      notes,
    }], { session });

    await Appointment.findByIdAndUpdate(apptId, { status: 'completed' }, { session });
    await session.commitTransaction();

    res.status(201).json({ success: true, data: payment[0], message: 'Төлбөр амжилттай бүртгэгдлээ.' });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

exports.getPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.from && req.query.to) {
    filter.paidAt = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
  }
  const result = await paginate(Payment, filter, req.query, [
    { path: 'patient', select: 'firstName lastName' },
    { path: 'appointment', select: 'date startTime' },
    { path: 'collectedBy', select: 'firstName lastName' },
  ]);
  res.json({ success: true, ...result });
});

exports.getPaymentsByPatient = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  if (role === 'patient' && !_id.equals(req.params.id)) throw new ApiError(403, 'Эрх байхгүй.');

  const payments = await Payment.find({ patient: req.params.id })
    .populate('appointment', 'date startTime')
    .sort('-paidAt');
  res.json({ success: true, data: payments });
});

exports.generateInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('patient', 'firstName lastName phone')
    .populate('appointment', 'date startTime')
    .populate('collectedBy', 'firstName lastName');
  if (!payment) throw new ApiError(404, 'Төлбөр олдсонгүй.');

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment.receiptNumber}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('Содон Сондор Шүдний Эмнэлэг', { align: 'center' });
  doc.moveDown().fontSize(14).text(`Нэхэмжлэх: ${payment.receiptNumber}`, { align: 'center' });
  doc.moveDown().fontSize(12);
  doc.text(`Өвчтөн: ${payment.patient.lastName} ${payment.patient.firstName}`);
  doc.text(`Огноо: ${new Date(payment.paidAt).toLocaleDateString('mn-MN')}`);
  doc.text(`Нийт дүн: ${payment.total.toLocaleString()}₮`);
  doc.text(`Төлбөрийн хэлбэр: ${payment.method}`);
  doc.moveDown().text('Баярлалаа!', { align: 'center' });
  doc.end();
});
