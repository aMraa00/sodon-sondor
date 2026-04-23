const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Ням, 1=Дав...
  startTime: { type: String }, // "09:00"
  endTime:   { type: String }, // "17:00"
  slotDuration: { type: Number, default: 30 }, // минут
  isWorking: { type: Boolean, default: true },
});

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    licenseNumber:  { type: String },
    experience:     { type: Number, default: 0 }, // жил
    education:      [{ degree: String, school: String, year: Number }],
    bio:            { type: String },
    consultationFee: { type: Number, default: 0 },
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    ratingCount:    { type: Number, default: 0 },
    schedule:       [scheduleSlotSchema],
    vacationDates:  [{ type: Date }],
    isAvailable:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ user: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isAvailable: 1 });

doctorSchema.virtual('profile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);
