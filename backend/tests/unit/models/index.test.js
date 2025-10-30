/**
 * Tests unitaires pour models/index.js
 * Vérifie que tous les modèles sont correctement exportés
 */
const models = require('../../../src/models');

describe('Models Index', () => {
  describe('Exports', () => {
    it('devrait exporter le modèle User', () => {
      expect(models.User).toBeDefined();
      expect(models.User.modelName).toBe('User');
    });

    it('devrait exporter un objet contenant tous les modèles', () => {
      expect(typeof models).toBe('object');
      expect(Object.keys(models)).toContain('User');
    });

    it('le modèle User devrait être un modèle Mongoose valide', () => {
      expect(models.User.schema).toBeDefined();
      expect(models.User.collection).toBeDefined();
    });
  });
});
