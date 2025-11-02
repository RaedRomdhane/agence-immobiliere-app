const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');
const crypto = require('crypto');

let mongoServer;

describe('Password Reset API', () => {
  let testUser;
  let testEmail = 'testreset@example.com';

  beforeAll(async () => {
    // Créer une base de données MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Créer un utilisateur de test
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'Reset',
      email: testEmail,
      phone: '+21698765432',
      password: 'OldPassword123!@#',
      role: 'client'
    });
  });

  afterAll(async () => {
    // Fermer la connexion et arrêter le serveur MongoDB
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/auth/forgot-password', () => {
    it.skip('devrait envoyer un email de réinitialisation pour un email valide', async () => {
      // TODO: Mocker nodemailer pour tester l'envoi d'email
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('email');

      // Vérifier que le token a été créé dans la base de données
      const user = await User.findOne({ email: testEmail });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
      expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
    });

    it('devrait retourner une erreur pour un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner un message générique pour un email inexistant (sécurité)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      // Pour des raisons de sécurité, on ne divulgue pas si l'email existe
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('email');
    });

    it('devrait retourner une erreur si l\'email est manquant', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;
    let hashedToken;

    beforeEach(async () => {
      // Générer un token de réinitialisation
      resetToken = crypto.randomBytes(32).toString('hex');
      hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Mettre à jour l'utilisateur avec le token
      await User.findByIdAndUpdate(testUser._id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: Date.now() + 3600000 // 1 heure
      });
    });

    it('devrait réinitialiser le mot de passe avec un token valide', async () => {
      const newPassword = 'NewPassword123!@#';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword,
          confirmPassword: newPassword
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('réinitialisé');

      // Vérifier que le token a été supprimé
      const user = await User.findById(testUser._id);
      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpires).toBeUndefined();

      // Vérifier que le nouveau mot de passe fonctionne
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: newPassword
        });

      expect(loginResponse.statusCode).toBe(200);
    });

    it('devrait retourner une erreur pour un token invalide', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          newPassword: 'NewPassword123!@#',
          confirmPassword: 'NewPassword123!@#'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner une erreur pour un token expiré', async () => {
      // Créer un token expiré
      const expiredToken = crypto.randomBytes(32).toString('hex');
      const expiredHashedToken = crypto.createHash('sha256').update(expiredToken).digest('hex');

      await User.findByIdAndUpdate(testUser._id, {
        resetPasswordToken: expiredHashedToken,
        resetPasswordExpires: Date.now() - 1000 // Expiré il y a 1 seconde
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewPassword123!@#',
          confirmPassword: 'NewPassword123!@#'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      // Simplement vérifier qu'il y a une erreur
      expect(response.body).toHaveProperty('error');
    });

    it('devrait retourner une erreur si les mots de passe ne correspondent pas', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!@#',
          confirmPassword: 'DifferentPassword123!@#'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner une erreur pour un mot de passe faible', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak',
          confirmPassword: 'weak'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner une erreur si le token est manquant', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: 'NewPassword123!@#',
          confirmPassword: 'NewPassword123!@#'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait invalider l\'ancien mot de passe après réinitialisation', async () => {
      const newPassword = 'NewPassword456!@#';

      // Réinitialiser le mot de passe
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword,
          confirmPassword: newPassword
        });

      // Essayer de se connecter avec l'ancien mot de passe
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'OldPassword123!@#'
        });

      expect(loginResponse.statusCode).toBe(401);
    });
  });
});
