const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize, User, Hospital } = require('./models');
const authMid = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', authMid(['Admin']), require('./routes/admin'));
app.use('/api/manager', authMid(['HospitalManager', 'Staff']), require('./routes/manager'));
app.use('/api/staff', authMid(['Staff']), require('./routes/staff'));
app.use('/api/patient', authMid(['User', 'Staff', 'Admin', 'HospitalManager']), require('./routes/patient'));

const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    console.log('--- Database Authenticated ---');
    
    // Sync models - using alter to update without dropping everything
    await sequelize.sync({ alter: true });
    console.log('--- Database Models Synced ---');

    // Seed Platform Admin
    await User.findOrCreate({
      where: { email: 'admin@medy.com' },
      defaults: {
        name: 'Platform Admin',
        phone: '9999999999',
        role: 'Admin',
        isVerified: true,
        password: 'admin' // Simple access for dev
      }
    });

    // Seed Super Admin if not exists
    await User.findOrCreate({
      where: { phone: '8309953012' },
      defaults: {
        name: 'Super Admin',
        email: 'lohithreddy1819@gmail.com',
        role: 'Admin',
        isVerified: true,
        password: 'admin'
      }
    }).catch(e => console.warn('Super Admin seed skipped or failed.'));

    // Seed default Hospital
    await Hospital.findOrCreate({
      where: { name: 'City General Hospital' },
      defaults: {
        location: 'New York, NY',
        status: 'Approved'
      }
    }).catch(e => {});

    console.log('--- System Seed Complete ---');
    console.log('--- Admin Account: admin@medy.com / 9999999999 (OTP: 1234) ---');

  } catch (err) {
    console.error('--- Bootstrap Failed ---');
    console.error(err.message);
  }
};

// INIT BOOTSTRAP (Crucial for Serverless like Vercel)
bootstrap();

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
      console.log(`--- Medy Backend Live @ Port ${PORT} ---`);
  });
}

module.exports = app;
