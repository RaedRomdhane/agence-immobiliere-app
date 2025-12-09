const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const FeatureFlag = require('../../src/models/FeatureFlag');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

let adminToken;
let adminUser;
let regularToken;
let regularUser;

describe('Feature Flags API', () => {
  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@featureflags.test',
      password: 'Password123!',
      phone: '+21620123456',
      role: 'admin',
      isActive: true,
    });
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Create regular user
    regularUser = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@featureflags.test',
      password: 'Password123!',
      phone: '+21698765432',
      role: 'client',
      isActive: true,
    });
    regularToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Create admin-panel feature flag (required for admin routes)
    await FeatureFlag.create({
      key: 'admin-panel',
      name: 'Admin Panel Access',
      description: 'Controls access to admin panel',
      enabled: true,
      targeting: {
        roles: ['admin']
      }
    });
  });
  
  afterAll(async () => {
    await FeatureFlag.deleteMany({});
    await User.deleteMany({});
  });
  
  afterEach(async () => {
    await FeatureFlag.deleteMany({});
  });
  
  describe('POST /api/feature-flags', () => {
    test('should create a new feature flag (admin)', async () => {
      const res = await request(app)
        .post('/api/feature-flags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'test-feature',
          name: 'Test Feature',
          description: 'A test feature flag',
          enabled: false,
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.key).toBe('test-feature');
      expect(res.body.data.enabled).toBe(false);
    });
    
    test('should reject flag creation with invalid key format', async () => {
      const res = await request(app)
        .post('/api/feature-flags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'Test Feature!', // Invalid characters
          name: 'Test Feature',
          description: 'A test feature flag',
        });
      
      expect(res.statusCode).toBe(400);
    });
    
    test('should reject flag creation by non-admin', async () => {
      const res = await request(app)
        .post('/api/feature-flags')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          key: 'test-feature',
          name: 'Test Feature',
          description: 'A test feature flag',
        });
      
      expect(res.statusCode).toBe(403);
    });
  });
  
  describe('GET /api/feature-flags', () => {
    beforeEach(async () => {
      await FeatureFlag.create([
        {
          key: 'feature-1',
          name: 'Feature 1',
          description: 'First feature',
          enabled: true,
        },
        {
          key: 'feature-2',
          name: 'Feature 2',
          description: 'Second feature',
          enabled: false,
        },
      ]);
    });
    
    test('should get all feature flags (admin)', async () => {
      const res = await request(app)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
    
    test('should reject non-admin access', async () => {
      const res = await request(app)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toBe(403);
    });
  });
  
  describe('PATCH /api/feature-flags/:key/toggle', () => {
    beforeEach(async () => {
      await FeatureFlag.create({
        key: 'toggle-test',
        name: 'Toggle Test',
        description: 'Test toggling',
        enabled: false,
      });
    });
    
    test('should toggle feature flag on', async () => {
      const res = await request(app)
        .patch('/api/feature-flags/toggle-test/toggle')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.enabled).toBe(true);
      
      const flag = await FeatureFlag.findOne({ key: 'toggle-test' });
      expect(flag.enabled).toBe(true);
      expect(flag.lastToggledAt).toBeDefined();
    });
    
    test('should toggle feature flag off', async () => {
      await FeatureFlag.updateOne({ key: 'toggle-test' }, { enabled: true });
      
      const res = await request(app)
        .patch('/api/feature-flags/toggle-test/toggle')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.enabled).toBe(false);
    });
  });
  
  describe('POST /api/feature-flags/:key/whitelist', () => {
    beforeEach(async () => {
      await FeatureFlag.create({
        key: 'whitelist-test',
        name: 'Whitelist Test',
        description: 'Test whitelisting',
        enabled: true,
        targeting: {
          emails: [],
          userIds: [],
          roles: [],
          percentage: 0,
        },
      });
    });
    
    test('should add emails to whitelist', async () => {
      const res = await request(app)
        .post('/api/feature-flags/whitelist-test/whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          emails: ['test1@example.com', 'test2@example.com'],
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.targeting.emails).toHaveLength(2);
      expect(res.body.data.targeting.emails).toContain('test1@example.com');
    });
    
    test('should add user IDs to whitelist', async () => {
      const res = await request(app)
        .post('/api/feature-flags/whitelist-test/whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [regularUser._id.toString()],
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.targeting.userIds).toHaveLength(1);
    });
  });
  
  describe('GET /api/feature-flags/:key/check', () => {
    beforeEach(async () => {
      await FeatureFlag.create({
        key: 'check-test',
        name: 'Check Test',
        description: 'Test checking',
        enabled: true,
        targeting: {
          emails: ['user@featureflags.test'],
          userIds: [],
          roles: [],
          percentage: 0,
        },
      });
    });
    
    test('should return true for whitelisted user', async () => {
      const res = await request(app)
        .get('/api/feature-flags/check-test/check')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.enabled).toBe(true);
    });
    
    test('should return false for non-whitelisted user', async () => {
      const res = await request(app)
        .get('/api/feature-flags/check-test/check')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.enabled).toBe(false);
    });
    
    test('should return false for disabled flag', async () => {
      await FeatureFlag.updateOne({ key: 'check-test' }, { enabled: false });
      
      const res = await request(app)
        .get('/api/feature-flags/check-test/check')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.enabled).toBe(false);
    });
  });
  
  describe('GET /api/feature-flags/my-flags', () => {
    beforeEach(async () => {
      await FeatureFlag.create([
        {
          key: 'all-users',
          name: 'All Users',
          description: 'Enabled for all',
          enabled: true,
        },
        {
          key: 'admin-only',
          name: 'Admin Only',
          description: 'Admin role only',
          enabled: true,
          targeting: {
            roles: ['admin'],
          },
        },
        {
          key: 'disabled',
          name: 'Disabled',
          description: 'Disabled flag',
          enabled: false,
        },
      ]);
    });
    
    test('should return correct flags for admin user', async () => {
      const res = await request(app)
        .get('/api/feature-flags/my-flags')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data['all-users']).toBe(true);
      expect(res.body.data['admin-only']).toBe(true);
      expect(res.body.data['disabled']).toBe(false);
    });
    
    test('should return correct flags for regular user', async () => {
      const res = await request(app)
        .get('/api/feature-flags/my-flags')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data['all-users']).toBe(true);
      expect(res.body.data['admin-only']).toBe(false);
      expect(res.body.data['disabled']).toBe(false);
    });
  });
});


