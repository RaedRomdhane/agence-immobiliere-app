/**
 * System Tests - End-to-End User Journey
 * Tests complete workflows from user registration to property interaction
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Property = require('../../src/models/Property');
const Appointment = require('../../src/models/Appointment');

describe('System Tests - Complete User Journeys', () => {

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({});
    await Property.deleteMany({});
    await Appointment.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Property.deleteMany({});
    await Appointment.deleteMany({});
  });

  describe('User Registration and Login Journey', () => {
    
    test('should complete full user registration and login flow', async () => {
      // Step 1: Register new user
      const registerData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        phone: '+21692345678'
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(registerData);
      
      if (registerRes.status !== 201) {
        console.log('Registration failed:', registerRes.status);
        console.log('Error details:', JSON.stringify(registerRes.body, null, 2));
      }
      
      expect(registerRes.status).toBe(201);

      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.data.token).toBeDefined();
      const token = registerRes.body.data.token;

      // Step 2: Login with credentials
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password
        })
        .expect(200);

      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined();

      // Step 3: Get user profile
      const profileRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileRes.body.data.user.email).toBe(registerData.email);
      expect(profileRes.body.data.user.firstName).toBe(registerData.firstName);
    });
  });

  describe('Property Search and Favorite Journey', () => {
    
    test('should search properties, add to favorites, and view favorites', async () => {
      // Setup: Create user and properties
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.favorite@example.com',
        password: 'TestPass123!',
        role: 'client',
        isEmailVerified: true
      });

      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const properties = await Property.create([
        {
          title: 'Appartement Tunis Centre',
          description: 'Bel appartement moderne au centre ville de Tunis',
          type: 'appartement',
          transactionType: 'vente',
          price: 250000,
          surface: 90,
          location: { address: '10 Ave Habib Bourguiba', city: 'Tunis', region: 'Tunis' },
          createdBy: user._id,
          photos: [{ url: 'https://example.com/photo1.jpg', filename: 'photo1.jpg', isPrimary: true }]
        },
        {
          title: 'Villa Sousse',
          description: 'Belle villa spacieuse avec piscine à Sousse',
          type: 'villa',
          transactionType: 'location',
          price: 2000,
          surface: 200,
          location: { address: '25 Rue de la Mer', city: 'Sousse', region: 'Sousse' },
          createdBy: user._id,
          photos: [{ url: 'https://example.com/photo2.jpg', filename: 'photo2.jpg', isPrimary: true }]
        },
        {
          title: 'Studio Tunis',
          description: 'Studio moderne et bien équipé au coeur de Tunis',
          type: 'studio',
          transactionType: 'location',
          price: 600,
          surface: 35,
          location: { address: '5 Rue de Paris', city: 'Tunis', region: 'Tunis' },
          createdBy: user._id,
          photos: [{ url: 'https://example.com/photo3.jpg', filename: 'photo3.jpg', isPrimary: true }]
        }
      ]);

      // Step 1: Search properties in Tunis
      const searchRes = await request(app)
        .get('/api/properties?city=Tunis')
        .expect(200);

      expect(searchRes.body.data).toHaveLength(2);

      // Step 2: Add property to favorites
      const propertyId = properties[0]._id.toString();
      const addFavoriteRes = await request(app)
        .post(`/api/users/${user._id}/favorites`)
        .set('Authorization', `Bearer ${token}`)
        .send({ propertyId })
        .expect(200);

      expect(addFavoriteRes.body.success).toBe(true);

      // Step 3: Get user favorites
      const favoritesRes = await request(app)
        .get(`/api/users/${user._id}/favorites/properties`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(favoritesRes.body.data).toHaveLength(1);
      expect(favoritesRes.body.data[0]._id).toBe(propertyId);

      // Step 4: Remove from favorites
      const removeFavoriteRes = await request(app)
        .delete(`/api/users/${user._id}/favorites`)
        .set('Authorization', `Bearer ${token}`)
        .send({ propertyId })
        .expect(200);

      expect(removeFavoriteRes.body.success).toBe(true);

      // Step 5: Verify favorites empty
      const emptyFavoritesRes = await request(app)
        .get(`/api/users/${user._id}/favorites/properties`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(emptyFavoritesRes.body.data).toHaveLength(0);
    });
  });

  describe('Appointment Request Journey', () => {
    
    test('should complete appointment request, accept, and view workflow', async () => {
      // Setup: Create users (admin + regular) and property
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin.system@test.com',
        password: 'AdminPass123!',
        role: 'admin',
        isEmailVerified: true
      });

      const user = await User.create({
        firstName: 'Client',
        lastName: 'Test',
        email: 'client.test@example.com',
        password: 'ClientPass123!',
        role: 'client',
        isEmailVerified: true
      });

      const property = await Property.create({
        title: 'Appartement à visiter',
        description: 'Appartement moderne disponible pour visite et achat',
        type: 'appartement',
        transactionType: 'vente',
        price: 200000,
        surface: 85,
        location: { address: '15 Rue Test', city: 'Tunis', region: 'Tunis' },
        createdBy: admin._id,
        photos: [{ url: 'https://example.com/photo.jpg', filename: 'photo.jpg', isPrimary: true }]
      });

      const jwt = require('jsonwebtoken');
      const userToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const adminToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      // Step 1: User requests appointment
      const appointmentRes = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          propertyId: property._id,
          message: 'Je souhaiterais visiter cet appartement'
        })
        .expect(201);

      expect(appointmentRes.body.success).toBe(true);
      const appointmentId = appointmentRes.body.data._id;

      // Step 2: Admin views pending appointments
      const pendingRes = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(pendingRes.body.data.length).toBeGreaterThan(0);
      const pendingAppointment = pendingRes.body.data.find(
        app => app._id === appointmentId
      );
      expect(pendingAppointment.status).toBe('pending');

      // Step 3: Admin accepts appointment
      const meetingDate = new Date(Date.now() + 86400000).toISOString();
      const acceptRes = await request(app)
        .patch(`/api/appointments/${appointmentId}/accept`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ meetingDate })
        .expect(200);

      expect(acceptRes.body.data.status).toBe('accepted');
      expect(acceptRes.body.data.meetingDate).toBeDefined();

      // Step 4: User views accepted appointments
      const userAppointmentsRes = await request(app)
        .get('/api/appointments/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const acceptedAppointment = userAppointmentsRes.body.data.find(
        app => app._id === appointmentId
      );
      expect(acceptedAppointment.status).toBe('accepted');
    });
  });

  describe('Admin Property Management Journey', () => {
    
    test('should create, update, and delete property as admin', async () => {
      // Setup: Create admin
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'Manager',
        email: 'admin.manager@test.com',
        password: 'AdminPass123!',
        role: 'admin',
        isEmailVerified: true
      });

      const jwt = require('jsonwebtoken');
      const adminToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      // Step 1: Create new property
      const propertyData = {
        title: 'Nouvelle Villa Luxueuse',
        description: 'Villa de luxe moderne avec piscine, jardin et prestations haut de gamme',
        type: 'villa',
        transactionType: 'vente',
        price: 800000,
        surface: 300,
        rooms: 6,
        bedrooms: 4,
        bathrooms: 3,
        features: {
          parking: true,
          garden: true,
          pool: true,
          furnished: true
        },
        location: {
          address: '50 Boulevard des Palmiers',
          city: 'Tunis',
          region: 'Tunis',
          zipCode: '1053'
        },
        photos: [{
          url: 'https://example.com/villa.jpg',
          filename: 'villa.jpg',
          isPrimary: true
        }]
      };

      const createRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(propertyData)
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const propertyId = createRes.body.data._id;

      // Step 2: Update property
      const updateRes = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 750000,
          description: 'Prix réduit ! Villa de luxe'
        })
        .expect(200);

      expect(updateRes.body.property.price).toBe(750000);

      // Step 3: Archive property
      const archiveRes = await request(app)
        .patch(`/api/properties/${propertyId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(archiveRes.body.success).toBe(true);
      expect(archiveRes.body.message).toContain('archivé');

      // Step 4: Delete property
      await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/properties/${propertyId}`)
        .expect(404);
    });
  });

  describe('Search Criteria Save Journey', () => {
    
    test('should save search criteria and retrieve results', async () => {
      // Setup: Create user and properties
      const user = await User.create({
        firstName: 'Search',
        lastName: 'User',
        email: 'search.user@example.com',
        password: 'SearchPass123!',
        role: 'client',
        isEmailVerified: true
      });

      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      await Property.create([
        {
          title: 'Appartement Pas Cher',
          description: 'Appartement économique idéal pour petits budgets',
          type: 'appartement',
          transactionType: 'location',
          price: 500,
          surface: 50,
          location: { address: '10 Rue A', city: 'Tunis', region: 'Tunis' },
          createdBy: user._id,
          photos: [{ url: 'https://example.com/cheap.jpg', filename: 'cheap.jpg', isPrimary: true }]
        },
        {
          title: 'Appartement Premium',
          description: 'Appartement haut standing avec prestations luxueuses',
          type: 'appartement',
          transactionType: 'location',
          price: 1500,
          surface: 120,
          location: { address: '20 Rue B', city: 'Tunis', region: 'Tunis' },
          createdBy: user._id,
          photos: [{ url: 'https://example.com/premium.jpg', filename: 'premium.jpg', isPrimary: true }]
        }
      ]);

      // Step 1: Save search criteria
      const searchCriteria = {
        name: 'Appartements pas chers',
        criteria: {
          filterField: 'type',
          typeValue: 'appartement',
          transactionTypeValue: 'location',
          sort: 'price-asc'
        }
      };

      const saveRes = await request(app)
        .post(`/api/users/${user._id}/saved-searches`)
        .set('Authorization', `Bearer ${token}`)
        .send(searchCriteria)
        .expect(200);

      expect(saveRes.body.success).toBe(true);

      // Step 2: Get saved searches
      const savedRes = await request(app)
        .get(`/api/users/${user._id}/saved-searches`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(savedRes.body.data).toHaveLength(1);
      expect(savedRes.body.data[0].name).toBe('Appartements pas chers');

      // Step 3: Search with criteria
      const searchRes = await request(app)
        .get('/api/properties?type=appartement&transactionType=location')
        .expect(200);

      expect(searchRes.body.data.length).toBeGreaterThan(0);
    });
  });
});
