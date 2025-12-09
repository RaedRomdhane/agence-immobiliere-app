/**
 * Integration Tests - Property API
 * Tests full CRUD operations on properties with database
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Property = require('../../src/models/Property');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Property API - Integration Tests', () => {
  let adminToken, userToken, adminUser, regularUser;

  // Helper function to create valid property data
  const createPropertyData = (overrides = {}) => ({
    title: 'Test Property',
    description: 'This is a detailed property description with at least 20 characters',
    type: 'appartement',
    transactionType: 'vente',
    price: 200000,
    surface: 80,
    location: {
      address: '123 Test Street',
      city: 'Tunis',
      region: 'Tunis'
    },
    createdBy: adminUser?._id || new mongoose.Types.ObjectId(),
    photos: [{
      url: 'https://example.com/photo.jpg',
      filename: 'photo.jpg',
      isPrimary: true
    }],
    ...overrides
  });

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
      isEmailVerified: true
    });

    // Create regular user
    regularUser = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@test.com',
      password: 'UserPass123!',
      role: 'client',
      isEmailVerified: true
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
  });

  afterEach(async () => {
    await Property.deleteMany({});
  });

  describe('GET /api/properties', () => {
    
    test('should return all properties for non-authenticated users', async () => {
      // Create test properties
      await Property.create([
        createPropertyData({
          title: 'Appartement 1',
          description: 'Beautiful modern apartment in Tunis city center with great amenities',
          type: 'appartement',
          transactionType: 'vente',
          price: 200000,
          surface: 80,
          location: {
            address: '123 Rue A',
            city: 'Tunis',
            region: 'Tunis'
          }
        }),
        createPropertyData({
          title: 'Villa 1',
          description: 'Luxurious villa in Sousse with spacious garden and modern design',
          type: 'villa',
          transactionType: 'location',
          price: 1500,
          surface: 200,
          location: {
            address: '456 Rue B',
            city: 'Sousse',
            region: 'Sousse'
          }
        })
      ]);

      const res = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    test('should filter properties by type', async () => {
      await Property.create([
        createPropertyData({
          title: 'Appartement 1',
          description: 'Beautiful modern apartment in Tunis city center with great amenities',
          type: 'appartement',
          transactionType: 'vente',
          price: 200000,
          surface: 80,
          location: { address: '123 Rue', city: 'Tunis', region: 'Tunis' }
        }),
        createPropertyData({
          title: 'Villa 1',
          description: 'Luxurious villa in Tunis with spacious garden and modern design',
          type: 'villa',
          transactionType: 'vente',
          price: 500000,
          surface: 200,
          location: { address: '456 Rue', city: 'Tunis', region: 'Tunis' }
        })
      ]);

      const res = await request(app)
        .get('/api/properties?type=villa')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe('villa');
    });

    test('should filter properties by price range', async () => {
      await Property.create([
        createPropertyData({
          title: 'Cheap Property',
          description: 'Affordable property with great value for money',
          type: 'appartement',
          transactionType: 'vente',
          price: 100000,
          surface: 60,
          location: { address: '123 Rue', city: 'Tunis', region: 'Tunis' }
        }),
        createPropertyData({
          title: 'Expensive Property',
          description: 'Luxury property with premium features and amenities',
          type: 'villa',
          transactionType: 'vente',
          price: 800000,
          surface: 300,
          location: { address: '456 Rue', city: 'Tunis', region: 'Tunis' }
        })
      ]);

      const res = await request(app)
        .get('/api/properties?maxPrice=200000')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].price).toBeLessThanOrEqual(200000);
    });

    test('should filter by city', async () => {
      await Property.create([
        createPropertyData({
          title: 'Property in Tunis',
          description: 'Beautiful property located in Tunis city center',
          type: 'appartement',
          transactionType: 'vente',
          price: 200000,
          surface: 80,
          location: { address: '123 Rue', city: 'Tunis', region: 'Tunis' }
        }),
        createPropertyData({
          title: 'Property in Sousse',
          description: 'Beautiful property located in Sousse coastal area',
          type: 'villa',
          transactionType: 'vente',
          price: 300000,
          surface: 150,
          location: { address: '456 Rue', city: 'Sousse', region: 'Sousse' }
        }
    )]);

      const res = await request(app)
        .get('/api/properties?city=Tunis')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].location.city).toBe('Tunis');
    });
  });

  describe('POST /api/properties', () => {
    
    test('should create property as admin', async () => {
      const propertyData = {
        title: 'New Apartment',
        description: 'Beautiful new apartment with modern amenities and great location',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 90,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        location: {
          address: '789 New Street',
          city: 'Tunis',
          region: 'Tunis',
          zipCode: '1000'
        },
        photos: [{
          url: 'https://example.com/photo1.jpg',
          filename: 'photo1.jpg',
          isPrimary: true
        }]
      };

      const res = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(propertyData);
      
      if (res.status !== 201) {
        console.log('Response status:', res.status);
        console.log('Response body:', res.body);
      }
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(propertyData.title);
      expect(res.body.data.price).toBe(propertyData.price);
    });

    test('should fail to create property without authentication', async () => {
      const propertyData = {
        title: 'New Apartment',
        description: 'Beautiful new apartment',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 90,
        location: {
          address: '789 New Street',
          city: 'Tunis',
          region: 'Tunis'
        }
      };

      await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect(401);
    });

    test('should fail to create property as regular user', async () => {
      const propertyData = {
        title: 'New Apartment',
        description: 'Beautiful new apartment',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 90,
        location: {
          address: '789 New Street',
          city: 'Tunis',
          region: 'Tunis'
        }
      };

      await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${userToken}`)
        .send(propertyData)
        .expect(403);
    });

    test('should fail validation with invalid data', async () => {
      const invalidData = {
        title: 'Too',
        description: 'Short',
        type: 'invalid_type',
        price: -100
      };

      await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/properties/:id', () => {
    
    test('should get property by ID', async () => {
      const property = await Property.create(createPropertyData({
        title: 'Test Property',
        description: 'Test description for property'
      }));

      const res = await request(app)
        .get(`/api/properties/${property._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(property._id.toString());
      expect(res.body.data.title).toBe('Test Property');
    });

    test('should return 404 for non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/properties/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/properties/:id', () => {
    
    test('should update property as admin', async () => {
      const property = await Property.create(createPropertyData({
        title: 'Original Title',
        description: 'This is the original property description'
      }));

      const updateData = {
        title: 'Updated Title',
        price: 250000
      };

      const res = await request(app)
        .put(`/api/properties/${property._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.property.title).toBe('Updated Title');
      expect(res.body.property.price).toBe(250000);
    });

    test('should fail to update as regular user', async () => {
      const property = await Property.create(createPropertyData({
        title: 'Test Property',
        description: 'This is a test property description'
      }));

      await request(app)
        .put(`/api/properties/${property._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    
    test('should delete property as admin', async () => {
      const property = await Property.create(createPropertyData({
        title: 'To Delete',
        description: 'This property will be deleted from the system'
      }));

      await request(app)
        .delete(`/api/properties/${property._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedProperty = await Property.findById(property._id);
      expect(deletedProperty).toBeNull();
    });

    test('should fail to delete as regular user', async () => {
      const property = await Property.create(createPropertyData({
        title: 'Test Property',
        description: 'This is a test property description for deletion'
      }));

      await request(app)
        .delete(`/api/properties/${property._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
