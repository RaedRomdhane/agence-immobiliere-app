const Migration = require('../Migration');

/**
 * Migration initiale : Création de la collection users avec indexes
 * Version: 001
 * Date: 2025-10-30
 */
class CreateUsersCollection extends Migration {
  constructor() {
    super('CreateUsersCollection', '001');
  }

  /**
   * Créer la collection users et ses index
   */
  async up() {
    try {
      this.log('Création de la collection users...');

      // Vérifier si la collection existe déjà
      const collections = await this.db.listCollections({ name: 'users' }).toArray();
      
      if (collections.length > 0) {
        this.log('La collection users existe déjà');
        return;
      }

      // Créer la collection avec validation
      await this.db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['firstName', 'lastName', 'email', 'password', 'role'],
            properties: {
              firstName: {
                bsonType: 'string',
                minLength: 2,
                maxLength: 50,
                description: 'Le prénom est requis (2-50 caractères)',
              },
              lastName: {
                bsonType: 'string',
                minLength: 2,
                maxLength: 50,
                description: 'Le nom est requis (2-50 caractères)',
              },
              email: {
                bsonType: 'string',
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                description: 'Email valide requis',
              },
              password: {
                bsonType: 'string',
                minLength: 6,
                description: 'Mot de passe requis (min 6 caractères)',
              },
              role: {
                enum: ['client', 'admin'],
                description: 'Rôle requis: client ou admin (admin a aussi les droits agent)',
              },
              isActive: {
                bsonType: 'bool',
                description: 'Statut actif du compte',
              },
              isEmailVerified: {
                bsonType: 'bool',
                description: 'Email vérifié ou non',
              },
            },
          },
        },
      });

      this.log('Collection users créée avec succès');

      // Créer les index
      this.log('Création des index...');
      
      const usersCollection = this.db.collection('users');

      // Index unique sur email
      await usersCollection.createIndex(
        { email: 1 },
        { 
          unique: true, 
          name: 'email_unique_index',
          collation: { locale: 'en', strength: 2 } // Case-insensitive
        }
      );
      this.log('✅ Index créé: email (unique)');

      // Index sur role
      await usersCollection.createIndex(
        { role: 1 },
        { name: 'role_index' }
      );
      this.log('✅ Index créé: role');

      // Index sur createdAt (pour tri chronologique)
      await usersCollection.createIndex(
        { createdAt: -1 },
        { name: 'created_at_index' }
      );
      this.log('✅ Index créé: createdAt');

      // Index composé pour recherche par ville
      await usersCollection.createIndex(
        { 'address.city': 1 },
        { name: 'address_city_index', sparse: true }
      );
      this.log('✅ Index créé: address.city');

      // Index pour les utilisateurs actifs
      await usersCollection.createIndex(
        { isActive: 1, role: 1 },
        { name: 'active_role_index' }
      );
      this.log('✅ Index créé: isActive + role (composé)');

      this.log('✅ Migration 001 terminée avec succès!');
    } catch (error) {
      this.error(`Erreur lors de la migration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprimer la collection users
   */
  async down() {
    try {
      this.log('Suppression de la collection users...');

      const collections = await this.db.listCollections({ name: 'users' }).toArray();
      
      if (collections.length === 0) {
        this.log('La collection users n\'existe pas');
        return;
      }

      await this.db.dropCollection('users');
      this.log('✅ Collection users supprimée');
      this.log('✅ Rollback 001 terminé avec succès!');
    } catch (error) {
      this.error(`Erreur lors du rollback: ${error.message}`);
      throw error;
    }
  }
}

module.exports = CreateUsersCollection;
