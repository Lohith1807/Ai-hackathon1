const express = require('express');
const router = express.Router();
const { Doctor, Slot, Appointment, WaitingList, User } = require('../models');

router.post('/doctors/:doctorId/generate-slots', async (req, res) => {
  try {
    const { date } = req.body;
    const doctor = await Doctor.findOne({ _id: req.params.doctorId, hospitalId: req.user.hospitalId });
    if (!doctor) return res.status(403).json({ error: 'Unauthorized specialist access' });
    
    await Slot.deleteMany({ doctorId: doctor._id, date, isBooked: false });
    
    let [startH, startM] = doctor.workingHoursStart.split(':').map(Number);
    let [endH, endM] = doctor.workingHoursEnd.split(':').map(Number);
    
    let currentStart = new Date(date);
    currentStart.setHours(startH, startM, 0);
    const end = new Date(date);
    end.setHours(endH, endM, 0);
    
    const duration = doctor.slotDurationMinutes;
    const slots = [];
    while (currentStart < end) {
      const startString = `${String(currentStart.getHours()).padStart(2, '0')}:${String(currentStart.getMinutes()).padStart(2, '0')}`;
      let nextSlot = new Date(currentStart.getTime() + duration * 60000);
      const endString = `${String(nextSlot.getHours()).padStart(2, '0')}:${String(nextSlot.getMinutes()).padStart(2, '0')}`;
      if (nextSlot <= end) {
        slots.push({ doctorId: doctor._id, date, startTime: startString, endTime: endString, isBooked: false });
      }
      currentStart = nextSlot;
    }
    
    const created = await Slot.insertMany(slots);
    res.json({ message: 'Clinical matrix provisioned successfully', count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/appointments', async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.user.hospitalId }).select('_id');
    const doctorIds = doctors.map(d => d._id);

    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } })
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name')
      .populate('slotId');
      
    // Map patientId back to Patient to keep response structure similar to Sequelize
    const formatted = appointments.map(a => {
      const doc = a.toObject();
      doc.Patient = doc.patientId;
      doc.Doctor = doc.doctorId;
      doc.Slot = doc.slotId;
      return doc;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const doctors = await Doctor.find({ hospitalId: req.user.hospitalId }).select('_id');
    const doctorIds = doctors.map(d => d._id.toString());
    
    const appt = await Appointment.findById(req.params.id).populate('slotId');
    if (!appt || !doctorIds.includes(appt.doctorId.toString())) {
      return res.status(403).json({ error: 'Unauthorized appointment access' });
    }
    
    appt.status = status;
    await appt.save();
    
    if (status === 'Cancelled' || status === 'Rejected') {
      const slot = await Slot.findById(appt.slotId._id);
      if (slot) {
        slot.isBooked = false;
        await slot.save();
      }
    }
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/waiting-list', async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.user.hospitalId }).select('_id');
    const doctorIds = doctors.map(d => d._id);

    const list = await WaitingList.find({ doctorId: { $in: doctorIds } })
      .populate('patientId')
      .populate('doctorId');
      
    const formatted = list.map(item => {
      const doc = item.toObject();
      doc.Patient = doc.patientId;
      doc.Doctor = doc.doctorId;
      return doc;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
