const User = require('../../models/User');

/**
 * Seeder pour créer des utilisateurs de test
 * Crée des comptes pour chaque rôle : admin, agent, client
 */
class UserSeeder {
  constructor() {
    this.name = 'UserSeeder';
  }

  /**
   * Créer les utilisateurs de test
   */
  async seed() {
    try {
      console.log('\n🌱 Seeding users...');
      console.log('========================================');

      // Vérifier si des users existent déjà
      const existingCount = await User.countDocuments();
      
      if (existingCount > 0) {
        console.log(`⚠️  ${existingCount} utilisateur(s) existant(s) détecté(s)`);
        console.log('Nettoyage de la collection users...');
        await User.deleteMany({});
        console.log('✅ Collection nettoyée');
      }

      // Données des utilisateurs de test
      const users = [
        // 1. Administrateur
        {
          firstName: 'Admin',
          lastName: 'Principal',
          email: 'admin@agence-immobiliere.fr',
          password: 'Admin123!',
          role: 'admin',
          phone: '+33612345678',
          address: {
            street: '123 Avenue des Champs-Élysées',
            city: 'Paris',
            postalCode: '75008',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },

        // 2. Agent immobilier principal
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@agence-immobiliere.fr',
          password: 'Agent123!',
          role: 'agent',
          phone: '+33623456789',
          address: {
            street: '45 Rue de la République',
            city: 'Lyon',
            postalCode: '69002',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },

        // 3. Deuxième agent
        {
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@agence-immobiliere.fr',
          password: 'Agent123!',
          role: 'agent',
          phone: '+33634567890',
          address: {
            street: '78 Boulevard Haussmann',
            city: 'Paris',
            postalCode: '75009',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },

        // 4. Troisième agent
        {
          firstName: 'Pierre',
          lastName: 'Dubois',
          email: 'pierre.dubois@agence-immobiliere.fr',
          password: 'Agent123!',
          role: 'agent',
          phone: '+33645678901',
          address: {
            street: '12 Place Bellecour',
            city: 'Lyon',
            postalCode: '69002',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },

        // 5-10. Clients
        {
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@example.com',
          password: 'Client123!',
          role: 'client',
          phone: '+33656789012',
          address: {
            street: '34 Rue Victor Hugo',
            city: 'Marseille',
            postalCode: '13001',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },
        {
          firstName: 'Thomas',
          lastName: 'Petit',
          email: 'thomas.petit@example.com',
          password: 'Client123!',
          role: 'client',
          phone: '+33667890123',
          address: {
            street: '89 Avenue Jean Médecin',
            city: 'Nice',
            postalCode: '06000',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },
        {
          firstName: 'Julie',
          lastName: 'Moreau',
          email: 'julie.moreau@example.com',
          password: 'Client123!',
          role: 'client',
          phone: '+33678901234',
          address: {
            street: '56 Cours Mirabeau',
            city: 'Aix-en-Provence',
            postalCode: '13100',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: false, // Email non vérifié
        },
        {
          firstName: 'Lucas',
          lastName: 'Simon',
          email: 'lucas.simon@example.com',
          password: 'Client123!',
          role: 'client',
          phone: '+33689012345',
          address: {
            street: '23 Rue Nationale',
            city: 'Lille',
            postalCode: '59000',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },
        {
          firstName: 'Emma',
          lastName: 'Laurent',
          email: 'emma.laurent@example.com',
          password: 'Client123!',
          role: 'client',
          phone: '+33690123456',
          address: {
            street: '67 Allée Jean Jaurès',
            city: 'Toulouse',
            postalCode: '31000',
            country: 'France',
          },
          isActive: false, // Compte désactivé
          isEmailVerified: true,
        },
        {
          firstName: 'Alexandre',
          lastName: 'Roux',
          email: 'alexandre.roux@example.com',
          password: 'Client123!',
          role: 'client',
          phone: '+33601234567',
          address: {
            street: '91 Quai Saint-Antoine',
            city: 'Lyon',
            postalCode: '69002',
            country: 'France',
          },
          isActive: true,
          isEmailVerified: true,
        },
      ];

      // Insérer les utilisateurs
      console.log(`\n📝 Insertion de ${users.length} utilisateurs...`);
      
      const createdUsers = await User.insertMany(users);

      console.log('\n✅ Utilisateurs créés avec succès!\n');
      console.log('========================================');
      console.log('📊 Résumé:');
      console.log('========================================');
      
      const stats = await User.getStats();
      console.log(`Total: ${stats.total} utilisateurs`);
      console.log(`Actifs: ${stats.active} utilisateurs`);
      console.log('\nPar rôle:');
      console.log(`  - Admins: ${stats.byRole.admin || 0}`);
      console.log(`  - Agents: ${stats.byRole.agent || 0}`);
      console.log(`  - Clients: ${stats.byRole.client || 0}`);
      console.log('========================================');

      console.log('\n🔑 Identifiants de test:');
      console.log('========================================');
      console.log('👤 Admin:');
      console.log('   Email: admin@agence-immobiliere.fr');
      console.log('   Password: Admin123!');
      console.log('');
      console.log('👤 Agent (Jean Dupont):');
      console.log('   Email: jean.dupont@agence-immobiliere.fr');
      console.log('   Password: Agent123!');
      console.log('');
      console.log('👤 Client (Sophie Bernard):');
      console.log('   Email: sophie.bernard@example.com');
      console.log('   Password: Client123!');
      console.log('========================================\n');

      return createdUsers;
    } catch (error) {
      console.error('❌ Erreur lors du seeding des users:', error.message);
      throw error;
    }
  }

  /**
   * Supprimer tous les utilisateurs de test
   */
  async clear() {
    try {
      console.log('\n🧹 Nettoyage des utilisateurs...');
      const result = await User.deleteMany({});
      console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s)\n`);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error.message);
      throw error;
    }
  }
}

module.exports = UserSeeder;
