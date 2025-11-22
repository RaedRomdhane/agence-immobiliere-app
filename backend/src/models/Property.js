
  const mongoose = require('mongoose');
  const QRCode = require('qrcode');

  // ...existing code...
const propertySchema = new mongoose.Schema({
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    minlength: [20, 'La description doit contenir au moins 20 caractères'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  type: {
    type: String,
    required: [true, 'Le type de bien est requis'],
    enum: {
      values: [
        // Résidentiel
        'appartement',
        'studio',
        'villa',
        'maison',
        'duplex',
        'triplex',
        'riad',
        'immeuble_residentiel',
        // Commercial
        'local_commercial',
        'magasin',
        'bureau',
        'espace_coworking',
        'showroom',
        'entrepot',
        'usine',
        // Terrains
        'terrain',
        'terrain_agricole',
        'terrain_nu',
        'ferme',
        // Spécialisés
        'parking',
        'cave',
        'hotel',
        'fonds_commerce',
        'clinique',
        'ecole',
        'salle_fete'
      ],
      message: '{VALUE} n\'est pas un type valide'
    }
  },
  transactionType: {
    type: String,
    required: [true, 'Le type de transaction est requis'],
    enum: {
      values: ['vente', 'location'],
      message: '{VALUE} n\'est pas un type de transaction valide'
    }
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  surface: {
    type: Number,
    required: [true, 'La surface est requise'],
    min: [1, 'La surface doit être au moins 1 m²']
  },
  rooms: {
    type: Number,
    min: [0, 'Le nombre de pièces ne peut pas être négatif'],
    default: 0
  },
  bedrooms: {
    type: Number,
    min: [0, 'Le nombre de chambres ne peut pas être négatif'],
    default: 0
  },
  bathrooms: {
    type: Number,
    min: [0, 'Le nombre de salles de bain ne peut pas être négatif'],
    default: 0
  },
  floor: {
    type: Number,
    min: [0, 'L\'étage ne peut pas être négatif']
  },
  location: {
    address: {
      type: String,
      required: [true, 'L\'adresse est requise']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    region: {
      type: String,
      required: [true, 'La région est requise']
    },
    zipCode: {
      type: String
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude invalide'],
        max: [90, 'Latitude invalide']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude invalide'],
        max: [180, 'Longitude invalide']
      }
    }
  },
  features: {
    parking: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    terrace: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    securitySystem: { type: Boolean, default: false }
  },
  photos: {
    type: [{
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    validate: {
      validator: function(photos) {
        return photos.length >= 1 && photos.length <= 10;
      },
      message: 'Un bien doit avoir entre 1 et 10 photos'
    }
  },
  qrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['disponible', 'vendu', 'loue', 'archive'],
    default: 'disponible'
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour la recherche
propertySchema.index({ title: 'text', description: 'text' });
propertySchema.index({ 'location.city': 1, type: 1, transactionType: 1 });
propertySchema.index({ price: 1, surface: 1 });
propertySchema.index({ status: 1, createdAt: -1 });

// Virtual pour le prix au m²
propertySchema.virtual('pricePerSquareMeter').get(function() {
  return this.surface > 0 ? Math.round(this.price / this.surface) : 0;
});

// Virtual pour la photo principale
propertySchema.virtual('primaryPhoto').get(function() {
  const primary = this.photos.find(p => p.isPrimary);
  return primary || this.photos[0];
});

// Méthode pour générer le QR code
propertySchema.methods.generateQRCode = async function() {
  try {
    const propertyUrl = `${process.env.FRONTEND_URL}/properties/${this._id}`;
    const qrCodeDataURL = await QRCode.toDataURL(propertyUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });
    this.qrCode = qrCodeDataURL;
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Erreur lors de la génération du QR code: ' + error.message);
  }
};

// Hook pre-save pour générer le QR code automatiquement
propertySchema.pre('save', async function(next) {
  if (this.isNew && !this.qrCode) {
    await this.generateQRCode();
  }
  next();
});

// Méthode pour incrémenter les vues
propertySchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
