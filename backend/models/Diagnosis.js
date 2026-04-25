const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    title:       { type: String, required: true },
    description: { type: String },
    icdCode:     { type: String }, // ICD-10 код
    teethAffected: [{ type: Number }], // FDI шүдний дугаар
    severity:    { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
    images:      [{ type: String }], // x-ray URLs
    followUpDate: { type: Date },
    isResolved:  { type: Boolean, default: false },
    aiSuggestion: {
      title:                { type: String },
      titleEn:              { type: String },
      icdCode:              { type: String },
      severity:             { type: String },
      description:          { type: String },
      recommendations:      [{ type: String }],
      differentialDiagnoses:[{ type: String }],
      urgency:              { type: String },
      confidence:           { type: Number },
      generatedAt:          { type: Date },
    },
  },
  { timestamps: true }
);

diagnosisSchema.index({ patient: 1 });
diagnosisSchema.index({ doctor: 1 });
diagnosisSchema.index({ appointment: 1 });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
