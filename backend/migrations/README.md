# Migrations de Base de Données

Ce dossier contient les migrations pour la base de données MongoDB.

## 📋 Convention de Nommage

Les fichiers de migration doivent suivre ce format:
```
YYYYMMDD_description.js
```

Exemple: `20250102_add_user_verification.js`

## 🏗️ Structure d'une Migration

```javascript
/**
 * Migration: Description
 * Created: Date
 */

module.exports = {
  /**
   * Appliquer la migration
   * @param {Object} db - Instance de la base de données MongoDB
   */
  async up(db) {
    // Code pour appliquer la migration
    await db.collection('users').updateMany(
      {},
      { $set: { emailVerified: false } }
    );
  },

  /**
   * Rollback de la migration
   * @param {Object} db - Instance de la base de données MongoDB
   */
  async down(db) {
    // Code pour annuler la migration
    await db.collection('users').updateMany(
      {},
      { $unset: { emailVerified: '' } }
    );
  }
};
```

## 🚀 Commandes

### Créer une nouvelle migration
```bash
npm run db:migrate create <nom>
```

### Appliquer les migrations
```bash
npm run db:migrate
```

### Voir le statut
```bash
npm run db:migrate:status
```

### Rollback
```bash
npm run db:migrate:down
```

## ⚠️ Bonnes Pratiques

1. **Toujours tester localement** avant de merger
2. **Écrire le `down()` en même temps** que le `up()`
3. **Ne jamais modifier** une migration déjà appliquée en production
4. **Créer une nouvelle migration** pour corriger une erreur
5. **Documenter** les changements importants
6. **Tester le rollback** avant de déployer

## 📝 Exemples

### Ajouter un champ
```javascript
async up(db) {
  await db.collection('users').updateMany(
    {},
    { $set: { newField: 'defaultValue' } }
  );
}

async down(db) {
  await db.collection('users').updateMany(
    {},
    { $unset: { newField: '' } }
  );
}
```

### Créer un index
```javascript
async up(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
}

async down(db) {
  await db.collection('users').dropIndex('email_1');
}
```

### Renommer un champ
```javascript
async up(db) {
  await db.collection('users').updateMany(
    {},
    { $rename: { oldName: 'newName' } }
  );
}

async down(db) {
  await db.collection('users').updateMany(
    {},
    { $rename: { newName: 'oldName' } }
  );
}
```

## 🔒 En Production

Les migrations sont exécutées automatiquement lors du déploiement staging via GitHub Actions.

Pour exécuter manuellement:
```bash
# Via Azure CLI
az webapp ssh --name agence-immobiliere-staging-backend --resource-group agence-immobiliere-staging-rg
npm run db:migrate
```
