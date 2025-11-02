const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Contrôleur Admin
 */

/**
 * @desc    Obtenir les statistiques de la plateforme (admin seulement)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.error('Accès refusé. Privilèges administrateur requis.', 403)
    );
  }

  // Compter les utilisateurs
  const totalUsers = await User.countDocuments();
  
  // Compter les nouveaux utilisateurs ce mois
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Compter les utilisateurs actifs
  const activeUsers = await User.countDocuments({
    isActive: true
  });

  // Compter les utilisateurs par rôle
  const adminCount = await User.countDocuments({ role: 'admin' });
  const clientCount = await User.countDocuments({ role: 'client' });

  // Statistiques placeholder (à compléter avec les vraies données quand les modèles seront créés)
  const stats = {
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
      active: activeUsers,
      byRole: {
        admin: adminCount,
        client: clientCount,
      }
    },
    properties: {
      total: 456, // Placeholder
      pending: 12, // Placeholder
      approved: 400, // Placeholder
      rejected: 44, // Placeholder
    },
    agents: {
      total: 34, // Placeholder
      active: 28, // Placeholder
    },
    revenue: {
      thisMonth: 45230, // Placeholder
      lastMonth: 40350, // Placeholder
      growth: 12, // Placeholder
    }
  };

  res.json(
    ApiResponse.success('Statistiques récupérées avec succès', { stats })
  );
});

/**
 * @desc    Obtenir la liste de tous les utilisateurs (admin seulement)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.error('Accès refusé. Privilèges administrateur requis.', 403)
    );
  }

  const { page = 1, limit = 10, role, isActive, search } = req.query;

  // Construire la requête de filtrage
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await User.countDocuments(query);

  res.json(
    ApiResponse.success('Utilisateurs récupérés avec succès', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    })
  );
});

/**
 * @desc    Mettre à jour un utilisateur (admin seulement)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.error('Accès refusé. Privilèges administrateur requis.', 403)
    );
  }

  const { id } = req.params;
  const { firstName, lastName, email, phone, role, isActive } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json(
      ApiResponse.error('Utilisateur non trouvé', 404)
    );
  }

  // Mettre à jour les champs
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.json(
    ApiResponse.success('Utilisateur mis à jour avec succès', {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      }
    })
  );
});

/**
 * @desc    Supprimer un utilisateur (admin seulement)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.error('Accès refusé. Privilèges administrateur requis.', 403)
    );
  }

  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json(
      ApiResponse.error('Utilisateur non trouvé', 404)
    );
  }

  // Ne pas permettre la suppression de son propre compte
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json(
      ApiResponse.error('Vous ne pouvez pas supprimer votre propre compte', 400)
    );
  }

  await user.deleteOne();

  res.json(
    ApiResponse.success('Utilisateur supprimé avec succès')
  );
});

module.exports = exports;
