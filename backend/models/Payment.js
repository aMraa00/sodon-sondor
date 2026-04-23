const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    services:    [{ service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, price: Number, qty: { type: Number, default: 1 } }],
    subtotal:    { type: Number, required: true },
    discount:    { type: Number, default: 0 },
    tax:         { type: Number, default: 0 },
    total:       { type: Number, required: true },
    method:      { type: String, enum: ['cash', 'card', 'qr', 'insurance', 'other'], default: 'cash' },
    status:      { type: String, enum: ['pending', 'paid', 'refunded', 'partial'], default: 'pending' },
    receiptNumber: { type: String, unique: true },
    paidAt:      { type: Date },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes:       { type: String },
    invoicePdf:  { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ patient: 1 });
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paidAt: 1 });

paymentSchema.pre('save', async function (next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    const y = new Date().getFullYear();
    this.receiptNumber = `INV-${y}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
