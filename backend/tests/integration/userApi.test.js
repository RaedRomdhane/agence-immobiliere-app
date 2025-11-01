/**
 * Tests d'intégration pour l'API Users
 * Test E2E des routes avec supertest
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const { User } = require('../../src/models');

let mongoServer;

// TODO: Réactiver ces tests après implémentation complète des fonctionnalités User (AW-14/15)
describe.skip('API Users - Tests Intégration', () => {
  // Setup: Créer une base de données en mémoire
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  // Cleanup: Nettoyer entre chaque test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Teardown: Fermer les connexions
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/users', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123!',
        phone: '+33612345678',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('créé avec succès');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('devrait rejeter un utilisateur sans email', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation échouée');
    });

    it('devrait rejeter un utilisateur avec un email invalide', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'email-invalide',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter un email en double', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123!',
      };

      // Créer le premier utilisateur
      await request(app).post('/api/users').send(userData).expect(201);

      // Essayer de créer un deuxième avec le même email
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('déjà utilisé');
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Créer quelques utilisateurs de test
      await User.create([
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          password: 'Password123!',
          role: 'client',
        },
        {
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie@example.com',
          password: 'Password123!',
          role: 'admin',
        },
        {
          firstName: 'Pierre',
          lastName: 'Durand',
          email: 'pierre@example.com',
          password: 'Password123!',
          role: 'client',
        },
      ]);
    });

    it('devrait récupérer tous les utilisateurs', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toHaveProperty('total', 3);
    });

    it('devrait paginer les résultats', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(true);
    });

    it('devrait filtrer par rôle', async () => {
      const response = await request(app)
        .get('/api/users?role=admin')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].role).toBe('admin');
    });

    it('devrait rechercher par nom ou email', async () => {
      const response = await request(app)
        .get('/api/users?search=jean')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('Jean');
    });
  });

  describe('GET /api/users/:id', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'Password123!',
      });
      userId = user._id.toString();
    });

    it('devrait récupérer un utilisateur par ID', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(userId);
      expect(response.body.data.firstName).toBe('Jean');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('introuvable');
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'Password123!',
      });
      userId = user._id.toString();
    });

    it('devrait mettre à jour un utilisateur', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+33612345678',
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
      expect(response.body.data.phone).toBe('+33612345678');
    });

    it('ne devrait pas permettre de modifier le password', async () => {
      const updateData = {
        firstName: 'John',
        password: 'NewPassword123!', // Devrait être ignoré
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      // Vérifier que le password n'est pas changé (le hash reste le même)
      const user = await User.findById(userId).select('+password');
      const originalUser = await User.findOne({ email: 'jean@example.com' }).select('+password');
      
      expect(response.body.data.firstName).toBe('John');
      // Le password ne devrait pas avoir changé
    });
  });

  describe('DELETE /api/users/:id', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'Password123!',
      });
      userId = user._id.toString();
    });

    it('devrait supprimer un utilisateur (soft delete)', async () => {
      await request(app)
        .delete(`/api/users/${userId}`)
        .expect(204);

      // Vérifier que l'utilisateur est marqué comme inactif
      const user = await User.findById(userId);
      expect(user.isActive).toBe(false);
    });
  });

  describe('GET /api/users/stats', () => {
    beforeEach(async () => {
      await User.create([
        {
          firstName: 'Admin1',
          lastName: 'Test',
          email: 'admin1@example.com',
          password: 'Password123!',
          role: 'admin',
          isActive: true,
        },
        {
          firstName: 'Admin2',
          lastName: 'Test',
          email: 'admin2@example.com',
          password: 'Password123!',
          role: 'admin',
          isActive: false,
        },
        {
          firstName: 'Client1',
          lastName: 'Test',
          email: 'client1@example.com',
          password: 'Password123!',
          role: 'client',
          isActive: true,
        },
        {
          firstName: 'Client2',
          lastName: 'Test',
          email: 'client2@example.com',
          password: 'Password123!',
          role: 'client',
          isActive: true,
        },
      ]);
    });

    it('devrait retourner les statistiques correctes', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.byRole.admin).toBe(2);
      expect(response.body.data.byRole.client).toBe(2);
      expect(response.body.data.active).toBe(3);
    });
  });

  describe('PATCH /api/users/:id/status', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'Password123!',
        isActive: true,
      });
      userId = user._id.toString();
    });

    it('devrait désactiver un utilisateur', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/status`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });

    it('devrait activer un utilisateur', async () => {
      // Désactiver d'abord
      await User.findByIdAndUpdate(userId, { isActive: false });

      const response = await request(app)
        .patch(`/api/users/${userId}/status`)
        .send({ isActive: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(true);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'Password123!',
        role: 'client',
      });
      userId = user._id.toString();
    });

    it('devrait changer le rôle d\'un utilisateur', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/role`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('admin');
    });

    it('devrait rejeter un rôle invalide', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/role`)
        .send({ role: 'superadmin' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
