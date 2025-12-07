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
  const allowedTypes = /jpeg|jpg|png|webp|gif|bmp|svg|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, JPG, PNG, WebP, GIF, BMP, SVG, AVIF) sont autorisées'));
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

// Multer config for CSV upload (in-memory)
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// --- ROUTES CSV D'ABORD ---
router.get('/csv-template', protect, restrictTo('admin'), propertyController.downloadCsvTemplate);
router.post('/import-csv', protect, restrictTo('admin'), csvUpload.single('file'), propertyController.importPropertiesCsv);
router.get('/import-csv-errors', protect, restrictTo('admin'), propertyController.downloadLastImportErrorsCsv);
router.get('/export-csv', protect, restrictTo('admin'), propertyController.exportPropertiesCsv);

// --- ROUTES CLASSIQUES ---
router.post('/', protect, restrictTo('admin'), upload.array('photos', 10), createPropertyValidation, propertyController.createProperty);
router.get('/', propertyController.getProperties); // Public route - unauthenticated users can view properties
router.get('/:id', propertyController.getPropertyById);
router.put('/:id', protect, restrictTo('admin'), upload.array('photos', 10), propertyController.updateProperty);
router.patch('/:id/archive', protect, restrictTo('admin'), propertyController.archiveProperty);
router.delete('/:id', protect, restrictTo('admin'), propertyController.deleteProperty);

module.exports = router;
