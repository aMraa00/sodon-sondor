const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String },
  frequency: { type: String },
  duration:  { type: String },
  notes:     { type: String },
});

const prescriptionSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    diagnosis:   { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis' },
    medications: [medicationSchema],
    instructions: { type: String },
    validUntil:  { type: Date },
    isDispensed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
