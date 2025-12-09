/**
 * Unit Tests - Property Model
 * Tests validation rules, virtuals, methods, and schema constraints
 */

const mongoose = require('mongoose');
const Property = require('../../../src/models/Property');

describe('Property Model - Unit Tests', () => {
  
  describe('Schema Validation', () => {
    
    test('should create a valid property with required fields', () => {
      const validProperty = new Property({
        title: 'Appartement moderne',
        description: 'Bel appartement avec vue sur mer, proche des commodités',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 85,
        location: {
          address: '123 Rue de la Paix',
          city: 'Tunis',
          region: 'Tunis',
          zipCode: '1000'
        },
        createdBy: new mongoose.Types.ObjectId(),
        photos: [{
          url: 'https://example.com/photo1.jpg',
          filename: 'photo1.jpg',
          isPrimary: true
        }]
      });

      const error = validProperty.validateSync();
      expect(error).toBeUndefined();
      expect(validProperty.title).toBe('Appartement moderne');
      expect(validProperty.type).toBe('appartement');
    });

    test('should fail validation when title is missing', () => {
      const property = new Property({
        description: 'Description test',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 85,
        location: {
          address: '123 Rue de la Paix',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      const error = property.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    test('should fail validation when title is too short', () => {
      const property = new Property({
        title: 'App',
        description: 'Description test minimum',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 85,
        location: {
          address: '123 Rue de la Paix',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      const error = property.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.message).toContain('au moins 5 caractères');
    });

    test('should fail validation when description is too short', () => {
      const property = new Property({
        title: 'Appartement test',
        description: 'Court',
        type: 'appartement',
        transactionType: 'vente',
        price: 250000,
        surface: 85,
        location: {
          address: '123 Rue de la Paix',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      const error = property.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.description).toBeDefined();
    });

    test('should fail validation with invalid type', () => {
      const property = new Property({
        title: 'Property test',
        description: 'Description valide pour le test',
        type: 'invalid_type',
        transactionType: 'vente',
        price: 250000,
        surface: 85,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      const error = property.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    test('should fail validation with negative price', () => {
      const property = new Property({
        title: 'Property test',
        description: 'Description valide pour le test',
        type: 'appartement',
        transactionType: 'vente',
        price: -100,
        surface: 85,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      const error = property.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });

    test('should accept valid property types', () => {
      const validTypes = ['appartement', 'studio', 'villa', 'maison', 'riad', 'terrain'];
      
      validTypes.forEach(type => {
        const property = new Property({
          title: 'Test property',
          description: 'Description valide pour test',
          type: type,
          transactionType: 'vente',
          price: 100000,
          surface: 50,
          location: {
            address: '123 Rue',
            city: 'Tunis',
            region: 'Tunis'
          },
          createdBy: new mongoose.Types.ObjectId(),
          photos: [{
            url: 'https://example.com/photo1.jpg',
            filename: 'photo1.jpg'
          }]
        });

        const error = property.validateSync();
        expect(error).toBeUndefined();
      });
    });

    test('should validate coordinates range', () => {
      const property = new Property({
        title: 'Property with coordinates',
        description: 'Description valide pour test',
        type: 'appartement',
        transactionType: 'vente',
        price: 100000,
        surface: 50,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis',
          coordinates: {
            latitude: 200, // Invalid
            longitude: 10
          }
        }
      });

      const error = property.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['location.coordinates.latitude']).toBeDefined();
    });
  });

  describe('Default Values', () => {
    
    test('should set default values for features', () => {
      const property = new Property({
        title: 'Test property',
        description: 'Description valide pour test',
        type: 'appartement',
        transactionType: 'vente',
        price: 100000,
        surface: 50,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      expect(property.features.parking).toBe(false);
      expect(property.features.garden).toBe(false);
      expect(property.features.pool).toBe(false);
    });

    test('should set default rooms to 0', () => {
      const property = new Property({
        title: 'Test property',
        description: 'Description valide pour test',
        type: 'appartement',
        transactionType: 'vente',
        price: 100000,
        surface: 50,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      expect(property.rooms).toBe(0);
      expect(property.bedrooms).toBe(0);
      expect(property.bathrooms).toBe(0);
    });

    test('should set default status to disponible', () => {
      const property = new Property({
        title: 'Test property',
        description: 'Description valide pour test',
        type: 'appartement',
        transactionType: 'vente',
        price: 100000,
        surface: 50,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        }
      });

      expect(property.status).toBe('disponible');
    });
  });

  describe('Business Logic', () => {
    
    test('should store createdBy reference', () => {
      const userId = new mongoose.Types.ObjectId();
      const property = new Property({
        title: 'Property with Owner',
        description: 'Description valide pour test',
        type: 'villa',
        transactionType: 'vente',
        price: 500000,
        surface: 200,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        },
        createdBy: userId,
        photos: [{ url: 'https://example.com/photo.jpg', filename: 'photo.jpg' }]
      });

      expect(property.createdBy).toEqual(userId);
    });

    test('should handle favorites array', () => {
      const property = new Property({
        title: 'Test property',
        description: 'Description valide pour test',
        type: 'appartement',
        transactionType: 'vente',
        price: 100000,
        surface: 50,
        location: {
          address: '123 Rue',
          city: 'Tunis',
          region: 'Tunis'
        },
        favorites: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
      });

      expect(Array.isArray(property.favorites)).toBe(true);
      expect(property.favorites).toHaveLength(2);
    });
  });
});
