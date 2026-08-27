const mongoose = require('mongoose');

// Helper to use UUID strings as _id or map string IDs
// For ease of migration, we'll let Mongoose use its native ObjectId,
// but we will alias 'id' to '_id' in the JSON output via virtuals.
const schemaOptions = {
  timestamps: true, // adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

// ── USER SCHEMA ──
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String },
  dob: { type: String }, // Storing as YYYY-MM-DD string
  location: { type: String },
  role: { 
    type: String, 
    enum: ['User', 'Admin', 'HospitalManager', 'Staff'],
    default: 'User'
  },
  idFile: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' } // For Staff/Manager
}, schemaOptions);

// ── HOSPITAL SCHEMA ──
const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  contactInfo: { type: String },
  specialties: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Approved' 
  }
}, schemaOptions);

// ── DOCTOR SCHEMA ──
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  workingHoursStart: { type: String, default: '09:00' },
  workingHoursEnd: { type: String, default: '17:00' },
  slotDurationMinutes: { type: Number, default: 15 },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Approved' 
  },
  fees: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }
}, schemaOptions);

// ── SLOT SCHEMA ──
const slotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },   // HH:mm
  isBooked: { type: Boolean, default: false },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
}, schemaOptions);

// ── APPOINTMENT SCHEMA ──
const appointmentSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true }
}, schemaOptions);

// ── WAITING LIST SCHEMA ──
const waitingListSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { 
    type: String, 
    enum: ['Waiting', 'Promoted', 'Cancelled'], 
    default: 'Waiting' 
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
}, schemaOptions);

// ── REVIEW SCHEMA ──
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
}, schemaOptions);

// ── MODEL REGISTRATION ──
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
const Slot = mongoose.models.Slot || mongoose.model('Slot', slotSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
const WaitingList = mongoose.models.WaitingList || mongoose.model('WaitingList', waitingListSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

module.exports = {
  User,
  Hospital,
  Doctor,
  Slot,
  Appointment,
  WaitingList,
  Review
};
