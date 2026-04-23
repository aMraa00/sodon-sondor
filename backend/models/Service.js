const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    nameEn:      { type: String },
    description: { type: String },
    category:    { type: String, enum: ['diagnosis', 'cleaning', 'whitening', 'filling', 'extraction', 'orthodontics', 'surgery', 'other'], default: 'other' },
    price:       { type: Number, required: true, min: 0 },
    duration:    { type: Number, required: true, default: 30 }, // минут
    icon:        { type: String },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
