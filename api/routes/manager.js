const express = require('express');
const router = express.Router();
const { Doctor, Hospital, User, Appointment } = require('../models');
const authMid = require('../middleware');

router.post('/doctors', async (req, res) => {
  try {
    const { name, specialization, experienceYears, workingHoursStart, workingHoursEnd, slotDurationMinutes, fees } = req.body;
    const hospitalId = req.user.hospitalId;
    if (!hospitalId) return res.status(400).json({ error: 'Manager must be assigned to a Hospital' });

    const doctor = await Doctor.create({
      name, specialization, experienceYears, workingHoursStart, workingHoursEnd, slotDurationMinutes, fees, hospitalId,
      status: 'Pending' 
    });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { id: req.params.id, hospitalId: req.user.hospitalId } });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found in your hospital' });
    
    await doctor.update(req.body);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { id: req.params.id, hospitalId: req.user.hospitalId } });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found in your hospital' });
    
    const activeAppts = await Appointment.count({ where: { doctorId: doctor.id, status: ['Pending', 'Confirmed'] } });
    if (activeAppts > 0) {
      return res.status(400).json({ error: 'Cannot remove Specialist with active appointments. Reschedule or Cancel them first.' });
    }
    
    await doctor.destroy();
    res.json({ message: 'Doctor record exempted from hospital registry.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({ where: { hospitalId: req.user.hospitalId } });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!['HospitalManager', 'Staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role for hospital team' });
    }

    const newUser = await User.create({
      name, email, phone, role, hospitalId: req.user.hospitalId,
      location: req.user.location, // Default to hospital location
      isVerified: true
    });
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({ 
      where: { hospitalId: req.user.hospitalId },
      attributes: ['id', 'name', 'email', 'phone', 'role'] 
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hospital', async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.user.hospitalId);
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
