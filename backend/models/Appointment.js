const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service:  { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date:     { type: Date, required: true },
    startTime: { type: String, required: true }, // "10:00"
    endTime:   { type: String, required: true },  // "10:30"
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    notes:       { type: String },
    cancelReason: { type: String },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ doctor: 1, date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
