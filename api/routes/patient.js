const express = require('express');
const router = express.Router();
const { User, Doctor, Hospital, Slot, Appointment, WaitingList, Review } = require('../models');
const authMid = require('../middleware');

router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'Approved' });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors', async (req, res) => {
  try {
    const { specialization, hospitalId } = req.query;
    let whereClause = { status: 'Approved' };
    if (specialization) whereClause.specialization = { $regex: specialization, $options: 'i' };
    if (hospitalId) whereClause.hospitalId = hospitalId;
    
    let doctors = await Doctor.find(whereClause).populate('hospitalId', 'name location');
    
    // Map hospitalId back to Hospital to match frontend expectation
    const formatted = doctors.map(d => {
      const doc = d.toObject();
      doc.Hospital = doc.hospitalId;
      return doc;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/doctors/:doctorId/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date required' });
    const slots = await Slot.find({ doctorId: req.params.doctorId, date, isBooked: false });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/appointments', authMid(['User']), async (req, res) => {
  try {
    const { slotId } = req.body;
    
    // Atomic update to prevent race conditions
    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { isBooked: true },
      { new: true }
    );
    
    if (!slot) {
      // Check if it exists but is booked
      const existingSlot = await Slot.findById(slotId);
      if (!existingSlot) return res.status(404).json({ error: 'Slot not found' });
      return res.status(400).json({ error: 'Slot already booked. Suggest joining waitlist.' });
    }
    
    const appt = await Appointment.create({
      patientId: req.user.id,
      doctorId: slot.doctorId,
      slotId: slot._id,
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
    const appts = await Appointment.find({ patientId: req.user.id })
      .populate({ 
        path: 'doctorId', 
        populate: { path: 'hospitalId' } 
      })
      .populate('slotId');
      
    const formatted = appts.map(a => {
      const doc = a.toObject();
      // Map structures back for frontend
      if (doc.doctorId) {
        doc.Doctor = doc.doctorId;
        doc.Doctor.Hospital = doc.doctorId.hospitalId;
      }
      doc.Slot = doc.slotId;
      return doc;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/doctors/:doctorId/reviews', authMid(['User']), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctorId = req.params.doctorId;
    
    const pastAppt = await Appointment.findOne({ patientId: req.user.id, doctorId, status: 'Completed' });
    if (!pastAppt) return res.status(403).json({ error: 'Can only review after completing an appointment' });
    
    const review = await Review.create({
      patientId: req.user.id,
      doctorId,
      rating,
      comment
    });
    
    const allReviews = await Review.find({ doctorId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Doctor.findByIdAndUpdate(doctorId, { rating: avg });
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
