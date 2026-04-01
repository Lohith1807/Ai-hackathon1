const express = require('express');
const router = express.Router();
const { User, Doctor, Hospital, Slot, Appointment, WaitingList, Review } = require('../models');
const { Op } = require('sequelize');
const authMid = require('../middleware');

router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({ where: { status: 'Approved' } });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors', async (req, res) => {
  try {
    const { specialization, hospitalId } = req.query;
    let whereClause = { status: 'Approved' };
    if (specialization) whereClause.specialization = { [Op.like]: `%${specialization}%` };
    if (hospitalId) whereClause.hospitalId = hospitalId;
    
    let doctors = await Doctor.findAll({
      where: whereClause,
      include: [{ model: Hospital, attributes: ['name', 'location'] }]
    });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors/:doctorId/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date required' });
    const slots = await Slot.findAll({ where: { doctorId: req.params.doctorId, date, isBooked: false } });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/appointments', authMid(['User']), async (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = await Slot.findByPk(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.isBooked) {
      return res.status(400).json({ error: 'Slot already booked. Suggest joining waitlist.' });
    }
    
    slot.isBooked = true;
    await slot.save();
    
    const appt = await Appointment.create({
      patientId: req.user.id,
      doctorId: slot.doctorId,
      slotId: slot.id,
      status: 'Pending'
    });
    
    res.json({ message: 'Appointment booked successfully', appt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/waitlist', authMid(['User']), async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const wl = await WaitingList.create({
      patientId: req.user.id,
      doctorId,
      date,
      status: 'Waiting'
    });
    res.json({ message: 'Added to waiting list', waitlist: wl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-appointments', authMid(['User']), async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [{ model: Doctor, include: [Hospital] }, Slot]
    });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/doctors/:doctorId/reviews', authMid(['User']), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctorId = req.params.doctorId;
    
    const pastAppt = await Appointment.findOne({ where: { patientId: req.user.id, doctorId, status: 'Completed' } });
    if (!pastAppt) return res.status(403).json({ error: 'Can only review after completing an appointment' });
    
    const review = await Review.create({
      patientId: req.user.id,
      doctorId,
      rating,
      comment
    });
    
    const allReviews = await Review.findAll({ where: { doctorId } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Doctor.update({ rating: avg }, { where: { id: doctorId } });
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
