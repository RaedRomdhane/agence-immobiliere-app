// --- CSV IMPORT/EXPORT ---
// Télécharger le template CSV
exports.downloadCsvTemplate = async (req, res) => {
  // Définir les colonnes du template CSV (correspondant au schéma Property)
  const headers = [
     'reference',
     'title',
     'description',
     'type',
     'transactionType',
     'price',
     'surface',
     'rooms',
     'bedrooms',
     'bathrooms',
     'floor',
     'location.address',
     'location.city',
     'location.region',
     'location.zipCode',
     'features.parking',
     'features.garden',
     'features.pool',
     'features.elevator',
     'features.balcony',
     'features.terrace',
     'features.furnished',
     'features.airConditioning',
     'features.heating',
     'features.securitySystem'
  ];

  // Générer la première ligne CSV (en-têtes)
  const csvHeader = headers.join(',') + '\n';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template_biens.csv"');
  res.status(200).send(csvHeader);
}

// Importer des biens via CSV
const csv = require('fast-csv');

// In-memory store for last import errors per user (for demo; use Redis or DB for production)
const lastImportErrorsByUser = {};

exports.importPropertiesCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Aucun fichier CSV fourni.' });
  }

  const results = [];
  let createdCount = 0;
  let updatedCount = 0;
  const errors = [];
  let rowIndex = 1; // 1-based for user-friendly error reporting
  const promises = [];

  csv.parseString(req.file.buffer.toString('utf8'), { headers: true, trim: true })
    .on('error', (error) => {
      return res.status(400).json({ success: false, message: 'Erreur parsing CSV', error: error.message });
    })
    .on('data', (row) => {
      rowIndex++;
      const p = (async () => {
        try {
          // Build propertyData from row
          const propertyData = {
            title: row['title'],
            description: row['description'],
            type: row['type'],
            transactionType: row['transactionType'],
            price: parseFloat(row['price']),
            surface: parseFloat(row['surface']),
            rooms: row['rooms'] ? parseInt(row['rooms']) : 0,
            bedrooms: row['bedrooms'] ? parseInt(row['bedrooms']) : 0,
            bathrooms: row['bathrooms'] ? parseInt(row['bathrooms']) : 0,
            floor: row['floor'] ? parseInt(row['floor']) : undefined,
            location: {
              address: row['location.address'],
              city: row['location.city'],
              region: row['location.region'],
              zipCode: row['location.zipCode'],
            },
            features: {
              parking: row['features.parking'] === 'true',
              garden: row['features.garden'] === 'true',
              pool: row['features.pool'] === 'true',
              elevator: row['features.elevator'] === 'true',
              balcony: row['features.balcony'] === 'true',
              terrace: row['features.terrace'] === 'true',
              furnished: row['features.furnished'] === 'true',
              airConditioning: row['features.airConditioning'] === 'true',
              heating: row['features.heating'] === 'true',
              securitySystem: row['features.securitySystem'] === 'true',
            },
            createdBy: req.user.id
          };

          // Validate required fields
          const missingFields = [];
          ['title','description','type','transactionType','price','surface','location.address','location.city','location.region'].forEach(f => {
            const val = f.includes('.') ? f.split('.').reduce((o,k)=>o&&o[k], propertyData) : propertyData[f];
            if (!val && val !== 0) missingFields.push(f);
          });
          if (missingFields.length > 0) {
            errors.push({ row: rowIndex, error: `Champs manquants: ${missingFields.join(', ')}` });
            return;
          }

          // Type and value checks
          if (typeof propertyData.price !== 'number' || isNaN(propertyData.price) || propertyData.price <= 0) {
            errors.push({ row: rowIndex, error: 'Le champ price doit être un nombre strictement positif.' });
            return;
          }
          if (typeof propertyData.surface !== 'number' || isNaN(propertyData.surface) || propertyData.surface <= 0) {
            errors.push({ row: rowIndex, error: 'Le champ surface doit être un nombre strictement positif.' });
            return;
          }
          // Integer checks for rooms, bedrooms, bathrooms, floor
          ['rooms','bedrooms','bathrooms'].forEach(f => {
            if (propertyData[f] !== undefined && propertyData[f] !== null && propertyData[f] !== '' && (!Number.isInteger(propertyData[f]) || propertyData[f] < 0)) {
              errors.push({ row: rowIndex, error: `Le champ ${f} doit être un entier positif ou nul.` });
              return;
            }
          });
          if (propertyData.floor !== undefined && propertyData.floor !== null && propertyData.floor !== '' && (!Number.isInteger(propertyData.floor))) {
            errors.push({ row: rowIndex, error: 'Le champ floor doit être un entier.' });
            return;
          }
          // Boolean checks for features
          const featureFields = ['parking','garden','pool','elevator','balcony','terrace','furnished','airConditioning','heating','securitySystem'];
          for (const f of featureFields) {
            if (row[`features.${f}`] && row[`features.${f}`] !== 'true' && row[`features.${f}`] !== 'false') {
              errors.push({ row: rowIndex, error: `Le champ features.${f} doit être 'true' ou 'false'.` });
              return;
            }
          }

          // Uniqueness check: reference or (title+address)
          let duplicate = null;
          if (row['reference']) {
            duplicate = await Property.findOne({ reference: row['reference'] });
            if (duplicate && (!row['id'] || (duplicate._id.toString() !== row['id']))) {
              errors.push({ row: rowIndex, error: `Un bien avec la référence '${row['reference']}' existe déjà.` });
              return;
            }
          } else {
            duplicate = await Property.findOne({
              title: propertyData.title,
              'location.address': propertyData.location.address
            });
            if (duplicate && (!row['id'] || (duplicate._id.toString() !== row['id']))) {
              errors.push({ row: rowIndex, error: `Un bien avec ce titre et cette adresse existe déjà.` });
              return;
            }
          }

          // Upsert logic: match by id column if present, else reference, else title+address
          try {
            let existing = null;
            // Try to match by id column (CSV export)
            if (row['id'] && row['id'].length === 24) {
              existing = await Property.findById(row['id']).catch(() => null);
            }
            // Try to match by reference field (legacy or fallback)
            if (!existing && row['reference'] && row['reference'].length === 24) {
              existing = await Property.findById(row['reference']).catch(() => null);
            }
            if (!existing && row['reference']) {
              existing = await Property.findOne({ reference: row['reference'] });
            }
            // Fallback to title + address
            if (!existing) {
              existing = await Property.findOne({
                title: propertyData.title,
                'location.address': propertyData.location.address
              });
            }
            if (existing) {
              // Check if any field is actually changed
              let modified = false;
              for (const key in propertyData) {
                if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
                  // Deep compare for nested objects (location, features)
                  const subObj = propertyData[key];
                  for (const subKey in subObj) {
                    if (JSON.stringify(existing[key]?.[subKey]) !== JSON.stringify(subObj[subKey])) {
                      modified = true;
                      break;
                    }
                  }
                  if (modified) break;
                } else {
                  if (JSON.stringify(existing[key]) !== JSON.stringify(propertyData[key])) {
                    modified = true;
                    break;
                  }
                }
              }
              if (modified) {
                Object.assign(existing, propertyData);
                await existing.save();
                results.push({ row: rowIndex, id: existing._id, updated: true });
                updatedCount++;
              } else {
                // Not modified, do not increment updatedCount
                results.push({ row: rowIndex, id: existing._id, updated: false });
              }
            } else {
              const property = new Property(propertyData);
              await property.save();
              results.push({ row: rowIndex, id: property._id, created: true });
              createdCount++;
            }
          } catch (err) {
            errors.push({ row: rowIndex, error: err.message });
          }
        } catch (err) {
          errors.push({ row: rowIndex, error: err.message });
        }
      })();
      promises.push(p);
    })
    .on('end', async (rowCount) => {
      await Promise.all(promises);
      // Store errors for this user for download (keyed by user id)
      if (req.user && req.user.id) {
        lastImportErrorsByUser[req.user.id] = errors;
      }
      res.status(200).json({
        success: true,
        imported: results.length,
        created: createdCount,
        updated: updatedCount,
        errors,
        total: rowCount
      });
    });

};

// Endpoint to download last import errors as CSV for the current user
exports.downloadLastImportErrorsCsv = (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId || !lastImportErrorsByUser[userId] || lastImportErrorsByUser[userId].length === 0) {
    return res.status(404).json({ success: false, message: 'Aucune erreur à télécharger.' });
  }
  const errors = lastImportErrorsByUser[userId];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="import_errors.csv"');
  res.write('row,error\n');
  for (const err of errors) {
    // Escape quotes and commas in error message
    const safeError = ('' + err.error).replace(/"/g, '""').replace(/\n/g, ' ');
    res.write(`${err.row},"${safeError}"\n`);
  }
  res.end();

};

// Exporter des biens en CSV (avec filtres)
const { format } = require('fast-csv');

exports.exportPropertiesCsv = async (req, res) => {
  // Build filters from query params (e.g., type, transactionType, status, city, minPrice, maxPrice)
  const filters = {};
  if (req.query.type) filters.type = req.query.type;
  if (req.query.transactionType) filters.transactionType = req.query.transactionType;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.city) filters['location.city'] = req.query.city;
  if (req.query.minPrice) filters.price = { ...filters.price, $gte: parseFloat(req.query.minPrice) };
  if (req.query.maxPrice) filters.price = { ...filters.price, $lte: parseFloat(req.query.maxPrice) };

  try {
    const properties = await Property.find(filters).lean();
    const headers = [
      'id',
      'reference',
      'title',
      'description',
      'type',
      'transactionType',
      'price',
      'surface',
      'rooms',
      'bedrooms',
      'bathrooms',
      'floor',
      'location.address',
      'location.city',
      'location.region',
      'location.zipCode',
      'features.parking',
      'features.garden',
      'features.pool',
      'features.elevator',
      'features.balcony',
      'features.terrace',
      'features.furnished',
      'features.airConditioning',
      'features.heating',
      'features.securitySystem'
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="export_biens.csv"');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    for (const p of properties) {
      csvStream.write({
          id: p._id,
          reference: p.reference || p._id,
          title: p.title,
          description: p.description,
          type: p.type,
          transactionType: p.transactionType,
          price: p.price,
          surface: p.surface,
          rooms: p.rooms,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          floor: p.floor,
          'location.address': p.location?.address,
          'location.city': p.location?.city,
          'location.region': p.location?.region,
          'location.zipCode': p.location?.zipCode,
          'features.parking': !!p.features?.parking,
          'features.garden': !!p.features?.garden,
          'features.pool': !!p.features?.pool,
          'features.elevator': !!p.features?.elevator,
          'features.balcony': !!p.features?.balcony,
          'features.terrace': !!p.features?.terrace,
          'features.furnished': !!p.features?.furnished,
          'features.airConditioning': !!p.features?.airConditioning,
          'features.heating': !!p.features?.heating,
          'features.securitySystem': !!p.features?.securitySystem
      });
    }
    csvStream.end();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur export CSV', error: err.message });
  }
};


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
        const loc = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
        // If coordinates provided, set them explicitly
        if (loc.coordinates && typeof loc.coordinates.latitude === 'number' && typeof loc.coordinates.longitude === 'number') {
          property.location = {
            ...property.location,
            ...loc,
            coordinates: {
              latitude: loc.coordinates.latitude,
              longitude: loc.coordinates.longitude
            }
          };
        } else {
          property.location = { ...property.location, ...loc };
        }
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

    // Support toggling onMap (admin can set/unset)
    if (typeof req.body.onMap !== 'undefined') {
      property.onMap = req.body.onMap === 'true' || req.body.onMap === true;
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
    // Compute changes (diff) between oldValues and property
    const getDiff = (oldObj, newObj) => {
      const diff = {};
      for (const key in newObj) {
        if (typeof newObj[key] === 'object' && newObj[key] !== null && oldObj[key]) {
          const nestedDiff = getDiff(oldObj[key], newObj[key]);
          if (Object.keys(nestedDiff).length > 0) diff[key] = nestedDiff;
        } else if (newObj[key] !== oldObj[key]) {
          diff[key] = { before: oldObj[key], after: newObj[key] };
        }
      }
      return diff;
    };
    const changes = getDiff(oldValues, property.toObject());
    // Only log history and send notifications if there are actual changes
    if (Object.keys(changes).length > 0) {
      await logPropertyHistory({
        propertyId: property._id,
        changedBy: req.user.id,
        changes
      });

      const Notification = require('../models/Notification');
      const User = require('../models/User');

      // Notify users who have this property as favorite (existing logic)
      if (Array.isArray(property.favorites) && property.favorites.length > 0) {
        // Get changed field names (flattened)
        const getChangedFields = (diff, prefix = "") => {
          let fields = [];
          for (const key in diff) {
            if (diff[key] && typeof diff[key] === 'object' && 'before' in diff[key] && 'after' in diff[key]) {
              fields.push((prefix ? prefix + '.' : '') + key);
            } else if (diff[key] && typeof diff[key] === 'object') {
              fields = fields.concat(getChangedFields(diff[key], (prefix ? prefix + '.' : '') + key));
            }
          }
          return fields;
        };
        // Only keep user-facing fields
        const allowedFields = [
          'title', 'description', 'type', 'transactionType', 'price', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'floor',
          'location.address', 'location.city', 'location.region', 'location.zipCode', 'location.coordinates.latitude', 'location.coordinates.longitude',
          'features.parking', 'features.garden', 'features.pool', 'features.elevator', 'features.balcony', 'features.terrace', 'features.furnished', 'features.airConditioning', 'features.heating', 'features.securitySystem',
          'onMap', 'status',
          // Only allow these subfields for photos
          'photos.url', 'photos.filename', 'photos.isPrimary'
        ];
        const changedFields = getChangedFields(changes).filter(field => {
          // Only allow specific subfields for photos
          if (field.startsWith('photos.')) {
            return (
              field === 'photos.url' ||
              field === 'photos.filename' ||
              field === 'photos.isPrimary' ||
              /^photos\.[0-9]+\.(url|filename|isPrimary)$/.test(field)
            );
          }
          return allowedFields.some(allowed => field === allowed || field.startsWith(allowed + '.'));
        });
        const changedFieldsText = changedFields.length > 0 ? changedFields.join(', ') : 'un ou plusieurs champs';
        const notifications = property.favorites.map(userId => ({
          user: userId,
          property: property._id,
          type: 'property_update',
          message: `Le bien "${property.title}" que vous avez mis en favori a été modifié par l'admin. Champs modifiés : ${changedFieldsText}.`,
        }));
        await Notification.insertMany(notifications);
      }

      // Notify all admins if property status changed to 'loué' or 'vendu'
      if (changes.status && (changes.status.after === 'loué' || changes.status.after === 'vendu')) {
        // Find all admins
        console.log('[DEBUG] Status changed to:', changes.status.after);
        const admins = await User.find({ role: 'admin', isActive: true });
        console.log('[DEBUG] Found admins:', admins.map(a => a.email || a._id));
        if (admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user: admin._id,
            property: property._id,
            type: 'property_update',
            message: `Le bien "${property.title}" a été ${changes.status.after === 'loué' ? 'loué' : 'vendu'}.`,
          }));
          console.log('[DEBUG] Creating admin notifications:', adminNotifications);
          try {
            await Notification.insertMany(adminNotifications);
            console.log('[DEBUG] Admin notifications inserted');
          } catch (notifErr) {
            console.error('[ERROR] Failed to insert admin notifications:', notifErr);
          }
        } else {
          console.log('[DEBUG] No admins found for notification');
        }
      }
    }
    // Always send a response to avoid hanging requests
    return res.json({ success: true, property });
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

    // Notify users who have this property in their favorites (now property exists)
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const usersWithFavorite = await User.find({ favorites: property._id });
    if (usersWithFavorite.length > 0) {
      const notifications = usersWithFavorite.map(user => ({
        user: user._id,
        property: property._id,
        type: 'property_update',
        message: `Le bien "${property.title}" dans vos favoris a été modifié.`,
        read: false
      }));
      await Notification.insertMany(notifications);
    }

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
    // Debug: Log the user making the request
    console.log('[getProperties] req.user:', req.user);
  try {
    const {
      page = 1,
      limit = 12,
      type,
      transactionType,
      city,
      region,
      address,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      minRooms,
      maxRooms,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minFloor,
      maxFloor,
      status,
      sort = '-createdAt',
      q // text search
    } = req.query;

    // Construction du filtre
    const filter = {};
    if (type) filter.type = type;
    if (transactionType) filter.transactionType = transactionType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (region) filter['location.region'] = new RegExp(region, 'i');
    if (address) filter['location.address'] = new RegExp(address, 'i');
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
    // --- Exact match for rooms, bedrooms, bathrooms, floor ---
    if (req.query.rooms !== undefined && req.query.rooms !== '') {
      filter.rooms = Number(req.query.rooms);
    } else if (minRooms || maxRooms) {
      filter.rooms = {};
      if (minRooms) filter.rooms.$gte = Number(minRooms);
      if (maxRooms) filter.rooms.$lte = Number(maxRooms);
    }
    if (req.query.bedrooms !== undefined && req.query.bedrooms !== '') {
      filter.bedrooms = Number(req.query.bedrooms);
    } else if (minBedrooms || maxBedrooms) {
      filter.bedrooms = {};
      if (minBedrooms) filter.bedrooms.$gte = Number(minBedrooms);
      if (maxBedrooms) filter.bedrooms.$lte = Number(maxBedrooms);
    }
    if (req.query.bathrooms !== undefined && req.query.bathrooms !== '') {
      filter.bathrooms = Number(req.query.bathrooms);
    } else if (minBathrooms || maxBathrooms) {
      filter.bathrooms = {};
      if (minBathrooms) filter.bathrooms.$gte = Number(minBathrooms);
      if (maxBathrooms) filter.bathrooms.$lte = Number(maxBathrooms);
    }
    if (req.query.floor !== undefined && req.query.floor !== '') {
      filter.floor = Number(req.query.floor);
    } else if (minFloor || maxFloor) {
      filter.floor = {};
      if (minFloor) filter.floor.$gte = Number(minFloor);
      if (maxFloor) filter.floor.$lte = Number(maxFloor);
    }

    // Text search in title and description
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex }
      ];
    }

    // Always apply case-insensitive status filter for any authenticated user if status is present
    console.log('[getProperties] req.user:', req.user);
    if (status) {
      if (typeof status === 'string') {
        filter.status = { $regex: `^${status}$`, $options: 'i' };
      } else {
        filter.status = status;
      }
    }


    // Debug: Log the constructed filter
    console.log('[getProperties] Filter:', JSON.stringify(filter));

    // Exécution de la requête avec pagination
    const properties = await Property.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Debug: Log the number of properties returned and their IDs
    console.log(`[getProperties] Returned properties: ${properties.length}`);
    console.log('[getProperties] Property IDs:', properties.map(p => p._id).join(', '));

    // Comptage total
    const count = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: properties,
      totalItems: count,
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

/**
 * @desc    Archiver un bien immobilier (soft delete)
 * @route   PATCH /api/properties/:id/archive
 * @access  Private/Admin
 */
exports.archiveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Bien non trouvé' });

    let action = '';
    if (property.status === 'archive') {
      // Unarchive: set status to 'disponible'
      property.status = 'disponible';
      action = 'unarchived';
    } else {
      // Archive: set status to 'archive'
      property.status = 'archive';
      action = 'archived';
    }
    await property.save();

    // Notifier les utilisateurs ayant mis en favori (only on archive)
    if (action === 'archived') {
      const Notification = require('../models/Notification');
      if (Array.isArray(property.favorites) && property.favorites.length > 0) {
        const notifications = property.favorites.map(userId => ({
          user: userId,
          property: property._id,
          type: 'property_update',
          message: `Le bien "${property.title}" que vous avez mis en favori a été archivé par l'admin.`,
        }));
        await Notification.insertMany(notifications);
      }
    }

    // Emit real-time update event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('propertyUpdated', {
        propertyId: property._id,
        data: property.toObject(),
      });
    }

    if (action === 'archived') {
      res.json({ success: true, message: 'Bien archivé avec succès' });
    } else {
      res.json({ success: true, message: 'Bien désarchivé avec succès' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur archivage/désarchivage', error: err.message });
  }
};

/**
 * @desc    Supprimer définitivement un bien immobilier
 * @route   DELETE /api/properties/:id
 * @access  Private/Admin
 */
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Bien non trouvé' });

    // Notifier les utilisateurs ayant mis en favori
    const Notification = require('../models/Notification');
    if (Array.isArray(property.favorites) && property.favorites.length > 0) {
      const notifications = property.favorites.map(userId => ({
        user: userId,
        property: property._id,
        type: 'property_update',
        message: `Le bien "${property.title}" que vous avez mis en favori a été supprimé par l'admin.`,
      }));
      await Notification.insertMany(notifications);
    }

    await property.deleteOne();

    // Emit real-time update event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('propertyUpdated', {
        propertyId: property._id,
        data: null,
        deleted: true,
      });
    }

    res.json({ success: true, message: 'Bien supprimé définitivement' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur suppression', error: err.message });
  }
};
