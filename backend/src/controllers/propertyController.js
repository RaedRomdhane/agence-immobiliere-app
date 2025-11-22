const Property = require('../models/Property');
const { validationResult } = require('express-validator');

/**
 * @desc    Créer un nouveau bien immobilier
 * @route   POST /api/properties
 * @access  Private/Admin
 */
exports.createProperty = async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Récupération des données du formulaire
    const propertyData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Traitement des fichiers uploadés (photos)
    if (req.files && req.files.length > 0) {
      propertyData.photos = req.files.map((file, index) => ({
        url: `/uploads/properties/${file.filename}`,
        filename: file.filename,
        isPrimary: index === 0 // La première photo est la principale
      }));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Au moins une photo est requise'
      });
    }

    // Traitement de la localisation
    if (req.body.location) {
      try {
        propertyData.location = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Format de localisation invalide'
        });
      }
    }

    // Traitement des caractéristiques (features)
    if (req.body.features) {
      try {
        propertyData.features = typeof req.body.features === 'string'
          ? JSON.parse(req.body.features)
          : req.body.features;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Format des caractéristiques invalide'
        });
      }
    }

    // Conversion des nombres
    const numberFields = ['price', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'floor'];
    numberFields.forEach(field => {
      if (propertyData[field]) {
        propertyData[field] = Number(propertyData[field]);
      }
    });

    // Création du bien
    const property = new Property(propertyData);
    await property.save();

    // Le QR code est généré automatiquement par le hook pre-save

    res.status(201).json({
      success: true,
      message: 'Bien immobilier créé avec succès',
      data: property
    });

  } catch (error) {
    console.error('Erreur création bien:', error);
    
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du bien',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer tous les biens immobiliers
 * @route   GET /api/properties
 * @access  Public
 */
exports.getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      transactionType,
      city,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      status = 'disponible',
      sort = '-createdAt'
    } = req.query;

    // Construction du filtre
    const filter = {};
    
    if (type) filter.type = type;
    if (transactionType) filter.transactionType = transactionType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (status) filter.status = status;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (minSurface || maxSurface) {
      filter.surface = {};
      if (minSurface) filter.surface.$gte = Number(minSurface);
      if (maxSurface) filter.surface.$lte = Number(maxSurface);
    }

    // Exécution de la requête avec pagination
    const properties = await Property.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Comptage total
    const count = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: Number(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération biens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des biens',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un bien par ID
 * @route   GET /api/properties/:id
 * @access  Public
 */
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email phone')
      .populate('updatedBy', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien immobilier non trouvé'
      });
    }

    // Incrémenter les vues (sauf si c'est l'admin qui consulte)
    if (!req.user || req.user.role !== 'admin') {
      await property.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Erreur récupération bien:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Bien immobilier non trouvé'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du bien',
      error: error.message
    });
  }
};
