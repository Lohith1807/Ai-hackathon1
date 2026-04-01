const express = require('express');
const router = express.Router();
const { Doctor, Slot, Appointment, WaitingList, User } = require('../models');
const authMid = require('../middleware');

router.post('/doctors/:doctorId/generate-slots', async (req, res) => {
  try {
    const { date } = req.body;
    const doctor = await Doctor.findOne({ where: { id: req.params.doctorId, hospitalId: req.user.hospitalId } });
    if (!doctor) return res.status(403).json({ error: 'Unauthorized specialist access' });
    
    await Slot.destroy({ where: { doctorId: doctor.id, date, isBooked: false } });
    
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
        slots.push({ doctorId: doctor.id, date, startTime: startString, endTime: endString, isBooked: false });
      }
      currentStart = nextSlot;
    }
    
    const created = await Slot.bulkCreate(slots);
    res.json({ message: 'Clinical matrix provisioned successfully', count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, as: 'Patient', attributes: ['name', 'phone'] },
        { model: Doctor, where: { hospitalId: req.user.hospitalId }, attributes: ['name'] },
        { model: Slot }
      ]
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const appt = await Appointment.findByPk(req.params.id, { 
      include: [{ model: Doctor, where: { hospitalId: req.user.hospitalId } }, Slot] 
    });
    if (!appt) return res.status(403).json({ error: 'Unauthorized appointment access' });
    
    appt.status = status;
    await appt.save();
    
    if (status === 'Cancelled' || status === 'Rejected') {
      const slot = appt.Slot;
      slot.isBooked = false;
      await slot.save();
    }
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/waiting-list', async (req, res) => {
  try {
    const list = await WaitingList.findAll({ 
      include: [
        { model: User, as: 'Patient' }, 
        { model: Doctor, where: { hospitalId: req.user.hospitalId } }
      ] 
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
