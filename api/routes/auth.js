const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Hospital } = require('../models');
const { Op } = require('sequelize');

/**
 * Register a new user in the system.
 * Expects name, email, phone, location, dob, idFile, and password in the request body.
 * Hashes the password and sets isVerified to true by default.
 * @route POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, location, dob, idFile, password } = req.body;
    let user = await User.findOne({ where: { phone } });
    if (user && user.isVerified) return res.status(400).json({ error: 'Phone already registered' });
    
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      await user.update({ name, email, location, dob, idFile, password: hashedPassword, isVerified: true });
    } else {
      await User.create({ name, email, phone, location, dob, idFile, password: hashedPassword, isVerified: true });
    }

    res.json({ message: 'Registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Authenticate a user and issue a JWT session token.
 * Supports identifier as either phone number or email address.
 * @route POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ phone: identifier }, { email: identifier }],
        isVerified: true 
      } 
    });
    
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) return res.status(401).json({ error: 'Invalid password.' });

    const token = jwt.sign({ id: user.id, role: user.role, hospitalId: user.hospitalId }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '1d' });
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
