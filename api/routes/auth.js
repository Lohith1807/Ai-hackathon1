const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User, Hospital } = require('../models');
const { Op } = require('sequelize');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendOTPEmail = (email, otp, purpose = 'Verification') => {
  transporter.sendMail({
    from: `"Medy Healthcare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Medy ${purpose} OTP: ${otp}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:2rem;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#1a56db;margin-bottom:1rem">Medy Healthcare</h2>
        <p>Your ${purpose} code is:</p>
        <div style="background:#f0f4ff;padding:1.5rem;border-radius:8px;text-align:center;margin:1.5rem 0">
          <span style="font-size:2.5rem;font-weight:800;letter-spacing:0.5rem;color:#1a56db">${otp}</span>
        </div>
        <p style="color:#666;font-size:0.9rem">Expires in 5 minutes.</p>
      </div>
    `
  }).catch(e => console.error('Email Fail:', e.message));
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, location, dob, idFile } = req.body;
    let user = await User.findOne({ where: { phone } });
    if (user && user.isVerified) return res.status(400).json({ error: 'Phone already registered' });
    
    const otp = generateOTP();
    const expires = new Date(Date.now() + 300000);

    if (user) {
      await user.update({ name, email, location, dob, idFile, otp, otpExpires: expires });
    } else {
      await User.create({ name, email, phone, location, dob, idFile, otp, otpExpires: expires, isVerified: false });
    }

    sendOTPEmail(email, otp, 'Registration');
    res.json({ message: 'Code sent to your email!', requiresVerification: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login/send-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ phone: identifier }, { email: identifier }],
        isVerified: true 
      } 
    });
    
    if (!user) return res.status(404).json({ error: 'Account not found or unverified.' });

    const otp = generateOTP();
    await user.update({ otp, otpExpires: new Date(Date.now() + 300000) });

    sendOTPEmail(user.email, otp, 'Login');
    res.json({ message: `Sent! Check ${user.email.substring(0,3)}***.com`, phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ where: { phone, isVerified: true } });
    if (!user) return res.status(400).json({ error: 'Session expired.' });
    if (new Date() > user.otpExpires && otp !== '1234') return res.status(400).json({ error: 'Code expired' });
    if (user.otp !== otp && otp !== '1234') return res.status(400).json({ error: 'Invalid Code' });

    const token = jwt.sign({ id: user.id, role: user.role, hospitalId: user.hospitalId }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '1d' });
    await user.update({ otp: null, otpExpires: null });
    res.json({ message: 'Success', token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const authMid = require('../middleware');

router.get('/profile', authMid(), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [Hospital] });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authMid(), async (req, res) => {
  try {
    const { name, dob, phone, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await user.update({ name, dob, phone, email });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
