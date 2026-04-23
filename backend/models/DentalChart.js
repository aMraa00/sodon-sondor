const mongoose = require('mongoose');

// FDI notation: 11-18 (дээд баруун), 21-28 (дээд зүүн), 31-38 (доод зүүн), 41-48 (доод баруун)
const toothSchema = new mongoose.Schema({
  toothNumber: { type: Number, required: true }, // 11-48
  status: {
    type: String,
    enum: ['healthy', 'caries', 'filling', 'missing', 'crown', 'root-canal', 'implant', 'bridge', 'extraction-needed'],
    default: 'healthy',
  },
  surfaces: {
    mesial:   { type: String },
    distal:   { type: String },
    occlusal: { type: String },
    buccal:   { type: String },
    lingual:  { type: String },
  },
  notes:       { type: String },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const dentalChartSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    teeth:   [toothSchema],
    notes:   { type: String },
    lastExamDate: { type: Date },
    examDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

dentalChartSchema.index({ patient: 1 });

module.exports = mongoose.model('DentalChart', dentalChartSchema);
