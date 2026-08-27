const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { sequelize, User, Hospital } = require('./models');
const authMid = require('./middleware');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Bootstrap: authenticate DB, sync tables, seed data
 */
let isDbReady = false;

async function bootstrap(useAlter = false) {
  if (isDbReady) return;
  try {
    await sequelize.authenticate();
    console.log('--- Database Authenticated ---');
    
    // sync: create tables if they don't exist. alter: also update columns (slower).
    await sequelize.sync(useAlter ? { alter: true } : {});
    console.log('--- Database Models Synced ---');

    // 1. Seed default Hospital first so we can link staff to it
    const [hospital] = await Hospital.findOrCreate({
      where: { name: 'City General Hospital' },
      defaults: {
        location: 'New York, NY',
        status: 'Approved'
      }
    });

    const hospitalId = hospital ? hospital.id : null;

    // 2. Hash passwords — only seed if no users exist yet
    const userCount = await User.count();
    if (userCount === 0) {
      const adminPass = await bcrypt.hash('admin123', 10);
      const managerPass = await bcrypt.hash('manager123', 10);
      const staffPass = await bcrypt.hash('staff123', 10);
      const userPass = await bcrypt.hash('user123', 10);

      // 3. Seed Roles
      await User.findOrCreate({
        where: { email: 'admin@gmail.com' },
        defaults: { name: 'Platform Admin', phone: '1000000001', role: 'Admin', isVerified: true, password: adminPass }
      });

      await User.findOrCreate({
        where: { email: 'manager@gmail.com' },
        defaults: { name: 'Hospital Manager', phone: '1000000002', role: 'HospitalManager', isVerified: true, password: managerPass, hospitalId }
      });

      await User.findOrCreate({
        where: { email: 'staff@gmail.com' },
        defaults: { name: 'General Staff', phone: '1000000003', role: 'Staff', isVerified: true, password: staffPass, hospitalId }
      });

      await User.findOrCreate({
        where: { email: 'user@gmail.com' },
        defaults: { name: 'Standard Patient', phone: '1000000004', role: 'User', isVerified: true, password: userPass }
      });
      console.log('--- System Seed Complete ---');
      console.log('--- Test Accounts Seeded: admin123, manager123, staff123, user123 ---');
    }

    isDbReady = true;
  } catch (err) {
    console.error('--- Bootstrap Failed ---');
    console.error(err.message);
  }
}

/**
 * Security & Efficiency Middlewares
 */
app.use(helmet({ contentSecurityPolicy: false })); // Basic security headers
app.use(compression()); // Gzip compression
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', apiLimiter);

// On Vercel: lazy-init DB on first API request (MUST be before route handlers)
if (process.env.VERCEL) {
  app.use('/api', async (req, res, next) => {
    await bootstrap(false); // lightweight sync (no alter)
    next();
  });
}

/**
 * Application Routes
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', authMid(['Admin']), require('./routes/admin'));
app.use('/api/manager', authMid(['HospitalManager', 'Staff']), require('./routes/manager'));
app.use('/api/staff', authMid(['Staff']), require('./routes/staff'));
app.use('/api/patient', authMid(['User', 'Staff', 'Admin', 'HospitalManager']), require('./routes/patient'));

/**
 * AI Chatbot Route – proxies to Gemini API so key stays server-side
 */
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }
  try {
    const { message, history } = req.body;
    const systemInstruction = `You are Medy AI, a helpful healthcare assistant for the Medy healthcare platform. 
CRITICAL RULE: You MUST detect the language of the user's message and reply in the SAME language. 
If the user writes in Telugu, reply in Telugu. If Hindi, reply in Hindi. If English, reply in English. 
If the user writes in any other language, reply in that language.
Keep responses concise, friendly, and helpful. Focus on healthcare topics like symptoms, appointments, general wellness, and hospital information.`;

    const contents = [];
    if (history && history.length > 0) {
      history.forEach(h => {
        contents.push({ role: h.role, parts: [{ text: h.text }] });
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API error (${response.status})`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that. Please try again.";
    res.json({ reply });
  } catch (err) {
    console.error('Chat API Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// On localhost: full bootstrap with alter at startup
if (!process.env.VERCEL) {
  bootstrap(true);
}

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
      console.log(`--- Medy Backend Live @ Port ${PORT} ---`);
  });
}

module.exports = app;
