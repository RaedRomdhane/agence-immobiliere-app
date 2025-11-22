// ...existing code...
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');
const propertyController = require('../controllers/propertyController');
const { protect, restrictTo } = require('../middlewares/auth');
/**
 * @route   POST /api/properties/:id/favorite
 * @desc    Ajouter un bien aux favoris de l'utilisateur connecté
 * @access  Private (user)
 */
router.post(
  '/:id/favorite',
  protect,
  async (req, res) => {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const Property = require('../models/Property');
    try {
      const property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ success: false, message: 'Bien non trouvé' });
      if (!property.favorites.includes(userId)) {
        property.favorites.push(userId);
        await property.save();
      }
      res.json({ success: true, message: 'Ajouté aux favoris' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erreur ajout favori', error: err.message });
    }
  }
);

/**
 * @route   DELETE /api/properties/:id/favorite
 * @desc    Retirer un bien des favoris de l'utilisateur connecté
 * @access  Private (user)
 */
router.delete(
  '/:id/favorite',
  protect,
  async (req, res) => {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const Property = require('../models/Property');
    try {
      const property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ success: false, message: 'Bien non trouvé' });
      property.favorites = property.favorites.filter(favId => favId.toString() !== userId);
      await property.save();
      res.json({ success: true, message: 'Retiré des favoris' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erreur suppression favori', error: err.message });
    }
  }
);


// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/properties');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, PNG, WebP) sont autorisées'));
  }
};

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB par fichier
  },
  fileFilter: fileFilter
});

// Validateurs
const createPropertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('La description doit contenir entre 20 et 2000 caractères'),
  body('type')
    .isIn([
      // Résidentiel
      'appartement', 'studio', 'villa', 'maison', 'duplex', 'triplex', 'riad', 'immeuble_residentiel',
      // Commercial
      'local_commercial', 'magasin', 'bureau', 'espace_coworking', 'showroom', 'entrepot', 'usine',
      // Terrains
      'terrain', 'terrain_agricole', 'terrain_nu', 'ferme',
      // Spécialisés
      'parking', 'cave', 'hotel', 'fonds_commerce', 'clinique', 'ecole', 'salle_fete'
    ])
    .withMessage('Type de bien invalide'),
  body('transactionType')
    .isIn(['vente', 'location'])
    .withMessage('Type de transaction invalide'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  body('surface')
    .isFloat({ min: 1 })
    .withMessage('La surface doit être au moins 1 m²')
];

// Routes
/**
 * @route   POST /api/properties
 * @desc    Créer un nouveau bien immobilier (Admin uniquement)
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  restrictTo('admin'),
  upload.array('photos', 10), // Max 10 photos
  createPropertyValidation,
  propertyController.createProperty
);

/**
 * @route   GET /api/properties
 * @desc    Récupérer tous les biens avec filtres et pagination
 * @access  Public
 */
router.get(
  '/',
  propertyController.getProperties
);

/**
 * @route   GET /api/properties/:id
 * @desc    Récupérer un bien par ID
 * @access  Public
 */
router.get(
  '/:id',
  propertyController.getPropertyById
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Modifier un bien immobilier (Admin uniquement)
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  upload.array('photos', 10), // Max 10 photos
  propertyController.updateProperty
);

module.exports = router;
