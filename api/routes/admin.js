const express = require('express');
const router = express.Router();
const { Hospital, Doctor, User } = require('../models');

router.post('/hospitals', async (req, res) => {
  try {
    const { name, location, contactInfo, specialties } = req.body;
    const hospital = await Hospital.create({ name, location, contactInfo, specialties, status: 'Approved' });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    const doctorCount = await Doctor.countDocuments({ status: 'Approved' });
    const pendingCount = await Doctor.countDocuments({ status: 'Pending' });
    res.json({ hospitalCount, doctorCount, pendingCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/doctors/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    
    doctor.status = status;
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'Pending' });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/hospitals/:id', async (req, res) => {
  try {
    const { name, location, contactInfo, specialties } = req.body;
    await Hospital.findByIdAndUpdate(req.params.id, { name, location, contactInfo, specialties });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors/approved', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'Approved' }).populate('hospitalId');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hospitals/:id/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.params.id });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hospitals/:id/staff', async (req, res) => {
  try {
    const staff = await User.find({ hospitalId: req.params.id }).select('_id name email phone role');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, role, hospitalId } = req.body;
    const user = await User.create({ name, email, phone, role, hospitalId, isVerified: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
