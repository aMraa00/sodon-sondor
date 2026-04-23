const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    patientCode: { type: String, unique: true },
    emergencyContact: {
      name:  { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    bloodType: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-',''] },
    allergies:   [{ type: String }],
    medicalHistory: [{ type: String }],
    insuranceNumber: { type: String },
    notes: { type: String },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

patientSchema.index({ user: 1 });
patientSchema.index({ patientCode: 1 });

patientSchema.pre('save', async function (next) {
  if (!this.patientCode) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientCode = `SS-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

patientSchema.virtual('profile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
