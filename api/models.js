const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING }, // Support for optional password login
  dob: { type: DataTypes.DATEONLY },
  location: { type: DataTypes.STRING },
  role: { 
    type: DataTypes.ENUM('User', 'Admin', 'HospitalManager', 'Staff'),
    defaultValue: 'User'
  },
  idFile: { type: DataTypes.TEXT('long') },
  otp: { type: DataTypes.STRING }, // OTP stored directly in User table
  otpExpires: { type: DataTypes.DATE },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Hospital = sequelize.define('Hospital', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  contactInfo: { type: DataTypes.TEXT },
  specialties: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Approved' }
});
User.belongsTo(Hospital, { foreignKey: 'hospitalId' });
Hospital.hasMany(User, { foreignKey: 'hospitalId' });

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  specialization: { type: DataTypes.STRING, allowNull: false },
  experienceYears: { type: DataTypes.INTEGER, defaultValue: 0 },
  workingHoursStart: { type: DataTypes.STRING, defaultValue: '09:00' },
  workingHoursEnd: { type: DataTypes.STRING, defaultValue: '17:00' },
  slotDurationMinutes: { type: DataTypes.INTEGER, defaultValue: 15 },
  status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Approved' },
  fees: { type: DataTypes.FLOAT, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 }
});
Doctor.belongsTo(Hospital, { foreignKey: 'hospitalId' });
Hospital.hasMany(Doctor, { foreignKey: 'hospitalId' });

const Slot = sequelize.define('Slot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false },
  endTime: { type: DataTypes.STRING, allowNull: false },
  isBooked: { type: DataTypes.BOOLEAN, defaultValue: false }
});
Slot.belongsTo(Doctor, { foreignKey: 'doctorId' });
Doctor.hasMany(Slot, { foreignKey: 'doctorId' });

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.ENUM('Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'), defaultValue: 'Pending' }
});
Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Appointment.belongsTo(Slot, { foreignKey: 'slotId' });

const WaitingList = sequelize.define('WaitingList', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Waiting', 'Promoted', 'Cancelled'), defaultValue: 'Waiting' }
});
WaitingList.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
WaitingList.belongsTo(Doctor, { foreignKey: 'doctorId' });

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT }
});
Review.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Review.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = {
  sequelize,
  User,
  Hospital,
  Doctor,
  Slot,
  Appointment,
  WaitingList,
  Review
};
