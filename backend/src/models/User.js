const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schéma utilisateur pour l'agence immobilière
 * 
 * @description Gère les utilisateurs avec rôles (client, agent, admin)
 * @version 1.0.0
 */
const userSchema = new mongoose.Schema(
  {
    // Informations de base
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Veuillez fournir un email valide',
      ],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne pas inclure le password par défaut dans les queries
    },

    // Informations de contact
    phone: {
      type: String,
      trim: true,
      match: [
        /^(\+33|0)[1-9](\d{2}){4}$/,
        'Veuillez fournir un numéro de téléphone français valide',
      ],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'France' },
    },

    // Rôle et permissions
    role: {
      type: String,
      enum: {
        values: ['client', 'admin'],
        message: '{VALUE} n\'est pas un rôle valide',
      },
      default: 'client',
    },

    // Statut du compte
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Réinitialisation du mot de passe
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // OAuth (Google, etc.)
    googleId: String,
    avatar: {
      type: String,
      default: null,
    },

    // Métadonnées
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Supprimer les champs sensibles lors de la sérialisation JSON
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
// Index pour améliorer les performances de recherche
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'address.city': 1 });

// ==================== VIRTUALS ====================
// Propriété virtuelle : nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Propriété virtuelle : compte verrouillé ?
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ==================== MIDDLEWARES ====================
/**
 * Hash le mot de passe avant de sauvegarder
 * S'exécute uniquement si le mot de passe a été modifié
 */
userSchema.pre('save', async function (next) {
  // Ne hasher que si le password a été modifié
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Générer un salt et hasher le password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Mise à jour de lastLogin lors de chaque connexion
 */
userSchema.pre('save', function (next) {
  if (this.isModified('lastLogin')) {
    this.lastLogin = Date.now();
  }
  next();
});

// ==================== MÉTHODES D'INSTANCE ====================
/**
 * Comparer le mot de passe fourni avec celui en base
 * @param {String} candidatePassword - Mot de passe à vérifier
 * @returns {Promise<Boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison des mots de passe');
  }
};

/**
 * Incrémenter les tentatives de connexion échouées
 * Verrouiller le compte après 5 tentatives
 */
userSchema.methods.incLoginAttempts = function () {
  // Si le compte est verrouillé et que la période est expirée
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Incrémenter les tentatives
  const updates = { $inc: { loginAttempts: 1 } };

  // Verrouiller le compte après 5 tentatives (2 heures)
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 heures

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

/**
 * Réinitialiser les tentatives de connexion après succès
 */
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 * @param {String} role - Rôle à vérifier
 * @returns {Boolean}
 */
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

/**
 * Vérifier si l'utilisateur a au moins un des rôles fournis
 * @param {Array<String>} roles - Liste de rôles à vérifier
 * @returns {Boolean}
 */
userSchema.methods.hasAnyRole = function (roles) {
  return roles.includes(this.role);
};

/**
 * Vérifier si l'utilisateur est un agent (admin)
 * @returns {Boolean}
 */
userSchema.methods.isAgent = function () {
  return this.role === 'admin';
};

/**
 * Vérifier si l'utilisateur est un admin
 * @returns {Boolean}
 */
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// ==================== MÉTHODES STATIQUES ====================
/**
 * Trouver un utilisateur par email
 * @param {String} email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Trouver tous les agents actifs (admins)
 * @returns {Promise<Array<User>>}
 */
userSchema.statics.findActiveAgents = function () {
  return this.find({ role: 'admin', isActive: true }).sort({ createdAt: -1 });
};

/**
 * Statistiques des utilisateurs
 * @returns {Promise<Object>}
 */
userSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });

  return {
    total,
    active,
    byRole: stats.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {}),
  };
};

// ==================== EXPORT ====================
const User = mongoose.model('User', userSchema);

module.exports = User;
