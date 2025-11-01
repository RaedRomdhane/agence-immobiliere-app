const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

describe('Tests d\'Intégration - Authentification', () => {
  beforeAll(async () => {
    // Créer une base de données MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    // Nettoyer la base de données après chaque test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Fermer la connexion et arrêter le serveur MongoDB
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Inscription réussie');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.user).not.toHaveProperty('password');

      // Vérifier que l'utilisateur est bien dans la base
      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.firstName).toBe(userData.firstName);
    });

    it('devrait hasher le mot de passe avant de le stocker', async () => {
      const userData = {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Récupérer l'utilisateur avec le mot de passe
      const userInDb = await User.findOne({ email: userData.email }).select('+password');
      
      expect(userInDb.password).toBeTruthy();
      expect(userInDb.password).not.toBe(userData.password); // Le mot de passe doit être hashé
      expect(userInDb.password).toMatch(/^\$2[aby]\$.{56}$/); // Format bcrypt
    });

    it('devrait rejeter l\'inscription sans email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('errors');
    });

    it('devrait rejeter un email invalide', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'email-invalide',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('devrait rejeter un mot de passe faible', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.errors.some(e => e.field === 'password')).toBe(true);
    });

    it('devrait rejeter si les mots de passe ne correspondent pas', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.errors.some(e => e.field === 'confirmPassword')).toBe(true);
    });

    it('devrait rejeter un email déjà utilisé', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      // Première inscription
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Deuxième inscription avec le même email
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('déjà utilisé');
    });

    it('devrait accepter un numéro de téléphone tunisien valide', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'phone-test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '+21695292324',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.data.user.phone).toBe(userData.phone);
    });

    it('devrait rejeter un numéro de téléphone invalide', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'phone-test2@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '123456', // Format invalide
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.errors.some(e => e.field === 'phone')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur pour les tests de connexion
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Login',
          lastName: 'Test',
          email: 'login@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });
    });

    it('devrait connecter un utilisateur avec succès', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Connexion réussie');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('devrait rejeter un email incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('incorrect');
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('incorrect');
    });

    it('devrait rejeter la connexion si l\'utilisateur est désactivé', async () => {
      // Désactiver l'utilisateur
      await User.updateOne({ email: 'login@example.com' }, { isActive: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('désactivé');
    });
  });
});
