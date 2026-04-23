const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:     { type: String, trim: true },
    password:  { type: String, required: true, minlength: 6, select: false },
    role:      { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient'], default: 'patient' },
    avatar:    { type: String, default: null },
    isActive:  { type: Boolean, default: true },
    address:   { type: String },
    dateOfBirth: { type: Date },
    gender:    { type: String, enum: ['male', 'female', 'other'] },
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.virtual('fullName').get(function () {
  return `${this.lastName} ${this.firstName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
