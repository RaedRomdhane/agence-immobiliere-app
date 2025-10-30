const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../../src/models/User');

/**
 * Tests unitaires pour le modèle User
 * Couvre : validation, hash password, méthodes, statiques
 */

describe('User Model', () => {
  let mongoServer;

  // Setup : démarrer MongoDB Memory Server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // Teardown : fermer connexion et arrêter serveur
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Nettoyer la base après chaque test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // ==================== TESTS DE CRÉATION ====================
  describe('Création d\'utilisateur', () => {
    it('devrait créer un utilisateur valide avec tous les champs', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        role: 'client',
        phone: '+33612345678',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        },
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.role).toBe('client');
      expect(user.phone).toBe('+33612345678');
      expect(user.address.city).toBe('Paris');
      expect(user.isActive).toBe(true);
      expect(user.isEmailVerified).toBe(false);
    });

    it('devrait créer un utilisateur avec les champs minimum requis', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'Pass123!',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.role).toBe('client'); // Valeur par défaut
      expect(user.isActive).toBe(true);
      expect(user.address.country).toBe('France'); // Valeur par défaut
    });

    it('devrait créer un admin', async () => {
      const userData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
      expect(user.isAgent()).toBe(true);
      expect(user.isAdmin()).toBe(true);
    });
  });

  // ==================== TESTS DE VALIDATION ====================
  describe('Validation des champs', () => {
    it('devrait rejeter un utilisateur sans prénom', async () => {
      const userData = {
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un utilisateur sans nom', async () => {
      const userData = {
        firstName: 'John',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un utilisateur sans email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un utilisateur sans password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un email invalide', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un prénom trop court', async () => {
      const userData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: '12345', // Moins de 6 caractères
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un rôle invalide', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'superadmin', // Rôle non autorisé
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un email en double', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
      };

      await User.create(userData);

      // Tentative de créer un deuxième utilisateur avec le même email
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait rejeter un téléphone français invalide', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
        phone: '1234567890', // Format invalide
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('devrait accepter un téléphone français valide (+33)', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
        phone: '+33612345678',
      };

      const user = await User.create(userData);
      expect(user.phone).toBe('+33612345678');
    });

    it('devrait accepter un téléphone français valide (0)', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test2@example.com',
        password: 'Password123!',
        phone: '0612345678',
      };

      const user = await User.create(userData);
      expect(user.phone).toBe('0612345678');
    });
  });

  // ==================== TESTS HASH PASSWORD ====================
  describe('Hash du mot de passe', () => {
    it('devrait hasher le mot de passe avant la sauvegarde', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'PlainPassword123',
      };

      const user = await User.create(userData);

      // Note: avec create(), mongoose peut retourner le password même avec select: false
      // Vérification : récupérer avec findById (devrait respecter select: false)
      const userWithoutPassword = await User.findById(user._id);
      expect(userWithoutPassword.password).toBeUndefined();

      // Récupérer le user avec le password explicitement
      const userWithPassword = await User.findById(user._id).select('+password');
      
      // Le password doit être hashé (commence par $2a$ ou $2b$ pour bcrypt)
      expect(userWithPassword.password).toBeDefined();
      expect(userWithPassword.password).not.toBe('PlainPassword123');
      expect(userWithPassword.password).toMatch(/^\$2[ab]\$/);
    });

    it('ne devrait pas re-hasher si le password n\'est pas modifié', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const originalHash = userWithPassword.password;

      // Modifier un autre champ
      userWithPassword.firstName = 'Jane';
      await userWithPassword.save();

      const updatedUser = await User.findById(user._id).select('+password');
      
      // Le hash ne devrait pas avoir changé
      expect(updatedUser.password).toBe(originalHash);
    });
  });

  // ==================== TESTS MÉTHODES D'INSTANCE ====================
  describe('Méthodes d\'instance', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'client',
      });
    });

    describe('comparePassword()', () => {
      it('devrait retourner true pour un mot de passe correct', async () => {
        const userWithPassword = await User.findById(user._id).select('+password');
        const isMatch = await userWithPassword.comparePassword('Password123!');
        expect(isMatch).toBe(true);
      });

      it('devrait retourner false pour un mot de passe incorrect', async () => {
        const userWithPassword = await User.findById(user._id).select('+password');
        const isMatch = await userWithPassword.comparePassword('WrongPassword');
        expect(isMatch).toBe(false);
      });
    });

    describe('hasRole()', () => {
      it('devrait retourner true si le rôle correspond', () => {
        expect(user.hasRole('client')).toBe(true);
      });

      it('devrait retourner false si le rôle ne correspond pas', () => {
        expect(user.hasRole('admin')).toBe(false);
      });
    });

    describe('hasAnyRole()', () => {
      it('devrait retourner true si un des rôles correspond', () => {
        expect(user.hasAnyRole(['admin', 'client'])).toBe(true);
      });

      it('devrait retourner false si aucun rôle ne correspond', () => {
        expect(user.hasAnyRole(['admin'])).toBe(false);
      });
    });

    describe('isAgent()', () => {
      it('devrait retourner true pour un admin', async () => {
        const admin = await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'Password123!',
          role: 'admin',
        });

        expect(admin.isAgent()).toBe(true);
      });

      it('devrait retourner false pour un client', () => {
        expect(user.isAgent()).toBe(false);
      });
    });

    describe('isAdmin()', () => {
      it('devrait retourner true pour un admin', async () => {
        const admin = await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'Password123!',
          role: 'admin',
        });

        expect(admin.isAdmin()).toBe(true);
      });

      it('devrait retourner false pour un client', () => {
        expect(user.isAdmin()).toBe(false);
      });
    });

    describe('incLoginAttempts()', () => {
      it('devrait incrémenter les tentatives de connexion', async () => {
        expect(user.loginAttempts).toBe(0);

        await user.incLoginAttempts();
        const updatedUser = await User.findById(user._id);
        
        expect(updatedUser.loginAttempts).toBe(1);
      });

      it('devrait verrouiller le compte après 5 tentatives', async () => {
        for (let i = 0; i < 5; i++) {
          await user.incLoginAttempts();
          user = await User.findById(user._id);
        }

        expect(user.loginAttempts).toBe(5);
        expect(user.lockUntil).toBeDefined();
        expect(user.isLocked).toBe(true);
      });
    });

    describe('resetLoginAttempts()', () => {
      it('devrait réinitialiser les tentatives de connexion', async () => {
        await user.incLoginAttempts();
        await user.incLoginAttempts();
        
        let updatedUser = await User.findById(user._id);
        expect(updatedUser.loginAttempts).toBe(2);

        await user.resetLoginAttempts();
        updatedUser = await User.findById(user._id);
        
        expect(updatedUser.loginAttempts).toBe(0);
        expect(updatedUser.lastLogin).toBeDefined();
      });
    });
  });

  // ==================== TESTS PROPRIÉTÉS VIRTUELLES ====================
  describe('Propriétés virtuelles', () => {
    it('devrait retourner le nom complet', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(user.fullName).toBe('John Doe');
    });

    it('devrait indiquer si le compte est verrouillé', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(user.isLocked).toBe(false);

      // Simuler un verrouillage
      user.lockUntil = Date.now() + 60000; // Verrouillé pour 1 minute
      await user.save();

      const lockedUser = await User.findById(user._id);
      expect(lockedUser.isLocked).toBe(true);
    });
  });

  // ==================== TESTS MÉTHODES STATIQUES ====================
  describe('Méthodes statiques', () => {
    beforeEach(async () => {
      // Créer quelques utilisateurs de test
      await User.create([
        {
          firstName: 'Client1',
          lastName: 'Test',
          email: 'client1@example.com',
          password: 'Password123!',
          role: 'client',
          isActive: true,
        },
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
      ]);
    });

    describe('findByEmail()', () => {
      it('devrait trouver un utilisateur par email', async () => {
        const user = await User.findByEmail('client1@example.com');
        
        expect(user).toBeDefined();
        expect(user.firstName).toBe('Client1');
      });

      it('devrait gérer les emails en majuscules', async () => {
        const user = await User.findByEmail('CLIENT1@EXAMPLE.COM');
        
        expect(user).toBeDefined();
        expect(user.email).toBe('client1@example.com');
      });

      it('devrait retourner null si email non trouvé', async () => {
        const user = await User.findByEmail('nonexistent@example.com');
        
        expect(user).toBeNull();
      });
    });

    describe('findActiveAgents()', () => {
      it('devrait retourner seulement les admins actifs', async () => {
        const agents = await User.findActiveAgents();
        
        expect(agents).toHaveLength(1);
        expect(agents[0].role).toBe('admin');
        expect(agents[0].isActive).toBe(true);
      });
    });

    describe('getStats()', () => {
      it('devrait retourner les statistiques correctes', async () => {
        const stats = await User.getStats();
        
        expect(stats.total).toBe(3);
        expect(stats.active).toBe(2);
        expect(stats.byRole.client).toBe(1);
        expect(stats.byRole.admin).toBe(2);
      });
    });
  });

  // ==================== TESTS SÉRIALISATION JSON ====================
  describe('Sérialisation JSON', () => {
    it('ne devrait pas inclure le password dans JSON', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      });

      const json = user.toJSON();
      
      expect(json.password).toBeUndefined();
      expect(json.resetPasswordToken).toBeUndefined();
      expect(json.emailVerificationToken).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });

    it('devrait inclure les propriétés virtuelles dans JSON', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      });

      const json = user.toJSON();
      
      expect(json.fullName).toBe('John Doe');
      expect(json.isLocked).toBeDefined();
    });
  });

  // ==================== TESTS TIMESTAMPS ====================
  describe('Timestamps', () => {
    it('devrait avoir createdAt et updatedAt', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait mettre à jour updatedAt lors de la modification', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      });

      const originalUpdatedAt = user.updatedAt;

      // Attendre 100ms pour s'assurer que le timestamp change
      await new Promise(resolve => setTimeout(resolve, 100));

      user.firstName = 'Jane';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
