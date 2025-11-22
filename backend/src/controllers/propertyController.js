const Property = require('../models/Property');
const { logPropertyHistory } = require('../utils/logPropertyHistory');
const { validationResult } = require('express-validator');
/**
 * @desc    Modifier un bien immobilier
 * @route   PUT /api/properties/:id
 * @access  Private/Admin
 */
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Bien non trouvé' });

    // Capture old values for history
    const oldValues = property.toObject();

    // Update fields - toujours mettre à jour même si les valeurs sont les mêmes
    property.title = req.body.title || property.title;
    property.description = req.body.description || property.description;
    property.type = req.body.type || property.type;
    property.price = req.body.price ? Number(req.body.price) : property.price;
    property.surface = req.body.surface ? Number(req.body.surface) : property.surface;
    property.transactionType = req.body.transactionType || property.transactionType;
    
    // Gestion des champs optionnels - permettre la valeur 0
    property.rooms = req.body.rooms !== undefined ? Number(req.body.rooms) : property.rooms;
    property.bedrooms = req.body.bedrooms !== undefined ? Number(req.body.bedrooms) : property.bedrooms;
    property.bathrooms = req.body.bathrooms !== undefined ? Number(req.body.bathrooms) : property.bathrooms;
    property.floor = req.body.floor !== undefined ? Number(req.body.floor) : property.floor;

    // Parse location/features si envoyés comme string JSON
    if (req.body.location) {
      try {
        property.location = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
      } catch (e) {
        console.error('Erreur parsing location:', e);
      }
    }

    if (req.body.features) {
      try {
        property.features = typeof req.body.features === 'string'
          ? JSON.parse(req.body.features)
          : req.body.features;
      } catch (e) {
        console.error('Erreur parsing features:', e);
      }
    }

    property.updatedBy = req.user.id;

    // Gestion des photos existantes et nouvelles
    let existingPhotos = [];
    if (req.body.existingPhotos) {
      try {
        existingPhotos = typeof req.body.existingPhotos === 'string' 
          ? JSON.parse(req.body.existingPhotos) 
          : req.body.existingPhotos;
      } catch (e) { 
        console.error('Erreur parsing existingPhotos:', e);
        existingPhotos = [];
      }
    }

    let newPhotos = [];
    if (req.files && req.files.length > 0) {
      newPhotos = req.files.map((file, index) => ({
        url: `/uploads/properties/${file.filename}`,
        filename: file.filename,
        isPrimary: false // sera défini ci-dessous
      }));
    }

    // Combiner les photos existantes et nouvelles, limiter à 10, définir la première comme principale
    const allPhotos = [...existingPhotos, ...newPhotos].slice(0, 10).map((p, i) => ({ 
      ...p, 
      isPrimary: i === 0 
    }));
    
    property.photos = allPhotos;

    await property.save();

    // Log modification history
    await logPropertyHistory({
      propertyId: property._id,
      changedBy: req.user.id,
      changes: {
        before: oldValues,
        after: property.toObject(),
      },
    });

    // Notify users who have favorited this property
    const Notification = require('../models/Notification');
    if (Array.isArray(property.favorites) && property.favorites.length > 0) {
      const notifications = property.favorites.map(userId => ({
        user: userId,
        property: property._id,
        type: 'property_update',
        message: `Le bien "${property.title}" que vous avez mis en favori a été modifié.`,
      }));
      await Notification.insertMany(notifications);
    }

    // Emit real-time update event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('propertyUpdated', {
        propertyId: property._id,
        data: property.toObject(),
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Bien immobilier modifié', 
      data: property 
    });
  } catch (error) {
    console.error('Erreur modification bien:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la modification du bien', 
      error: error.message 
    });
  }
};
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
