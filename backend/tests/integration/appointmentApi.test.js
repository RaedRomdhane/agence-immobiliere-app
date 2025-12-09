/**
 * Integration Tests - Appointment API
 * Tests appointment request, accept, deny workflows
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Appointment = require('../../src/models/Appointment');
const Property = require('../../src/models/Property');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Appointment API - Integration Tests', () => {
  let adminToken, userToken, adminUser, regularUser, testProperty;

  beforeAll(async () => {
    // Create users
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin.appointment@test.com',
      password: 'AdminPass123!',
      role: 'admin',
      isEmailVerified: true
    });

    regularUser = await User.create({
      firstName: 'User',
      lastName: 'Test',
      email: 'user.appointment@test.com',
      password: 'UserPass123!',
      role: 'client',
      isEmailVerified: true
    });

    // Create test property
    testProperty = await Property.create({
      title: 'Test Property for Appointments',
      description: 'Property used for appointment testing',
      type: 'appartement',
      transactionType: 'vente',
      price: 200000,
      surface: 85,
      location: {
        address: '123 Test Street',
        city: 'Tunis',
        region: 'Tunis'
      },
      createdBy: adminUser._id,
      photos: [{
        url: 'https://example.com/photo.jpg',
        filename: 'photo.jpg',
        isPrimary: true
      }]
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { id: regularUser._id, email: regularUser.email, role: regularUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Property.deleteMany({});
    await Appointment.deleteMany({});
  });

  afterEach(async () => {
    await Appointment.deleteMany({});
  });

  describe('POST /api/appointments', () => {
    
    test('should create appointment request as user', async () => {
      const appointmentData = {
        propertyId: testProperty._id,
        message: 'Je suis intéressé par cette propriété'
      };

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appointmentData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.property).toBe(testProperty._id.toString());
      expect(res.body.data.user).toBe(regularUser._id.toString());
      expect(res.body.data.status).toBe('pending');
    });

    test('should fail without authentication', async () => {
      const appointmentData = {
        propertyId: testProperty._id,
        message: 'Test message'
      };

      await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(401);
    });

    test('should fail with missing propertyId', async () => {
      const appointmentData = {
        message: 'Test message'
      };

      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appointmentData)
        .expect(400);
    });

    test('should fail for non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const appointmentData = {
        propertyId: fakeId,
        message: 'Test message'
      };

      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appointmentData)
        .expect(404);
    });

    test('should prevent duplicate pending requests', async () => {
      // Create first appointment
      await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'First request'
      });

      // Try to create duplicate
      const appointmentData = {
        propertyId: testProperty._id,
        message: 'Second request'
      };

      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appointmentData)
        .expect(409);
    });
  });

  describe('GET /api/appointments/user', () => {
    
    test('should get user appointments', async () => {
      // Create appointments for user
      await Appointment.create([
        {
          user: regularUser._id,
          property: testProperty._id,
          status: 'pending',
          message: 'Request 1'
        },
        {
          user: regularUser._id,
          property: testProperty._id,
          status: 'accepted',
          message: 'Request 2',
          meetingDate: new Date(Date.now() + 86400000)
        }
      ]);

      const res = await request(app)
        .get('/api/appointments/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    test('should fail without authentication', async () => {
      await request(app)
        .get('/api/appointments/user')
        .expect(401);
    });
  });

  describe('GET /api/appointments (Admin)', () => {
    
    test('should get all appointments as admin', async () => {
      await Appointment.create([
        {
          user: regularUser._id,
          property: testProperty._id,
          status: 'pending',
          message: 'Request 1'
        },
        {
          user: regularUser._id,
          property: testProperty._id,
          status: 'accepted',
          message: 'Request 2'
        }
      ]);

      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should fail as regular user', async () => {
      await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/appointments/:id/accept (Admin)', () => {
    
    test('should accept appointment as admin', async () => {
      const appointment = await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'Request to accept'
      });

      const meetingDate = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .patch(`/api/appointments/${appointment._id}/accept`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ meetingDate })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('accepted');
      expect(res.body.data.meetingDate).toBeDefined();
    });

    test('should fail without meeting date', async () => {
      const appointment = await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'Request'
      });

      await request(app)
        .patch(`/api/appointments/${appointment._id}/accept`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    test('should fail as regular user', async () => {
      const appointment = await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'Request'
      });

      const meetingDate = new Date(Date.now() + 86400000).toISOString();
      await request(app)
        .patch(`/api/appointments/${appointment._id}/accept`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ meetingDate })
        .expect(403);
    });
  });

  describe('PATCH /api/appointments/:id/deny (Admin)', () => {
    
    test('should deny appointment as admin', async () => {
      const appointment = await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'Request to deny'
      });

      const res = await request(app)
        .patch(`/api/appointments/${appointment._id}/deny`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ denialReason: 'Property no longer available' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('denied');
      expect(res.body.data.denialReason).toBe('Property no longer available');
    });

    test('should fail without denial reason', async () => {
      const appointment = await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'Request'
      });

      await request(app)
        .patch(`/api/appointments/${appointment._id}/deny`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    test('should fail as regular user', async () => {
      const appointment = await Appointment.create({
        user: regularUser._id,
        property: testProperty._id,
        status: 'pending',
        message: 'Request'
      });

      await request(app)
        .patch(`/api/appointments/${appointment._id}/deny`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ denialReason: 'Test reason' })
        .expect(403);
    });
  });
});
