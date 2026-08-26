const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');
const { User, Hospital } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Models
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Hospital: {},
}));

jest.mock('../middleware', () => {
  return () => (req, res, next) => {
    req.user = { id: 1, role: 'User' };
    next();
  };
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          location: 'Test City',
          dob: '1990-01-01',
          idFile: 'data:image/png;base64,123',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registered successfully!');
      expect(User.create).toHaveBeenCalled();
    });

    it('should fail if phone is already registered', async () => {
      User.findOne.mockResolvedValue({ id: 1, phone: '1234567890', isVerified: true });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ phone: '1234567890' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Phone already registered');
    });

    it('should fail if password is not provided', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/register')
        .send({ phone: '1234567890' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      User.findOne.mockResolvedValue({
        id: 1,
        phone: '1234567890',
        password: hashedPassword,
        isVerified: true,
        role: 'User'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: '1234567890', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Success');
      expect(res.body.token).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      User.findOne.mockResolvedValue({
        id: 1,
        phone: '1234567890',
        password: hashedPassword,
        isVerified: true,
        role: 'User'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: '1234567890', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid password.');
    });

    it('should fail if account not found', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: '1234567890', password: 'password123' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Account not found.');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile', async () => {
      User.findByPk.mockResolvedValue({ id: 1, name: 'Test User' });

      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test User');
    });
  });
});
