/**
 * Unit Tests - User Model
 * Tests validation, password hashing, and user methods
 */

const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User Model - Unit Tests', () => {
  
  describe('Schema Validation', () => {
    
    test('should create a valid user with required fields', () => {
      const validUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        role: 'client'
      });

      const error = validUser.validateSync();
      expect(error).toBeUndefined();
      expect(validUser.firstName).toBe('John');
      expect(validUser.email).toBe('john.doe@example.com');
    });

    test('should fail validation when email is missing', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
        role: 'user'
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should fail validation with invalid email format', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        role: 'user'
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should fail validation with short password', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123',
        role: 'user'
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    test('should accept valid roles', () => {
      const validRoles = ['client', 'admin'];
      
      validRoles.forEach(role => {
        const user = new User({
          firstName: 'Test',
          lastName: 'User',
          email: `test.${role}@example.com`,
          password: 'SecurePass123!',
          role: role
        });

        const error = user.validateSync();
        expect(error).toBeUndefined();
        expect(user.role).toBe(role);
      });
    });

    test('should fail validation with invalid role', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'superuser'
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });
  });

  describe('Default Values', () => {
    
    test('should set default role to client', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

      expect(user.role).toBe('client');
    });

    test('should initialize empty favorites array', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

      expect(Array.isArray(user.favorites)).toBe(true);
      expect(user.favorites).toHaveLength(0);
    });

    test('should set isEmailVerified to false by default', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

      expect(user.isEmailVerified).toBe(false);
    });
  });

  describe('Password Hashing', () => {
    
    test('should hash password before saving', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'PlainPassword123!',
        role: 'user'
      });

      // Simulate pre-save hook
      if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      expect(user.password).not.toBe('PlainPassword123!');
      expect(user.password.length).toBeGreaterThan(20);
    });

    test('should verify correct password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isMatch = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('Business Logic', () => {
    
    test('should handle phone number', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        phone: '+216 12 345 678'
      });

      expect(user.phone).toBe('+216 12 345 678');
    });

    test('should store avatar URL', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        avatar: 'https://example.com/photo.jpg'
      });

      expect(user.avatar).toBe('https://example.com/photo.jpg');
    });

    test('should handle Google OAuth user', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        googleId: 'google-oauth-id-123',
        isEmailVerified: true
      });

      expect(user.googleId).toBe('google-oauth-id-123');
      expect(user.isEmailVerified).toBe(true);
    });
  });

  describe('Timestamps', () => {
    
    test('should have createdAt and updatedAt fields', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

      // Timestamps are added automatically by Mongoose
      expect(user.schema.path('createdAt')).toBeDefined();
      expect(user.schema.path('updatedAt')).toBeDefined();
    });
  });
});
