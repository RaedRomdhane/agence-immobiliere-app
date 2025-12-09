// GET /api/appointments/user - Get appointments for the authenticated user
exports.getUserAppointments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('property', 'title type location price status')
      .sort({ requestedAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des rendez-vous utilisateur.', error: err.message });
  }
};
// GET /api/appointments/global-status - Get global appointment status for all properties
exports.getGlobalAppointmentStatus = async (req, res) => {
  try {
    // Only allow authenticated users
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    // Find all appointments with status 'pending' or 'accepted'
    const appointments = await Appointment.find({
      status: { $in: ['pending', 'accepted'] }
    }).select('property status user');
    // Build map: { [propertyId]: { status, userId } }
    const statusMap = {};
    appointments.forEach(app => {
      const propId = String(app.property);
      // Only one appointment per property: prefer 'pending', else 'accepted'
      if (!statusMap[propId] || (statusMap[propId].status !== 'pending' && app.status === 'pending')) {
        statusMap[propId] = { status: app.status, userId: String(app.user) };
      }
    });
    res.json(statusMap);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du statut global des rendez-vous.', error: err.message });
  }
};
// PATCH /api/appointments/:id/accept - Admin accepts an appointment
exports.acceptAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const { id } = req.params;
    const { meetingDate } = req.body;
    if (!meetingDate) return res.status(400).json({ success: false, message: 'Date de rendez-vous requise.' });
    const appointment = await Appointment.findById(id).populate('property');
    if (!appointment) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé.' });
    if (appointment.status !== 'pending') return res.status(400).json({ success: false, message: 'Rendez-vous déjà traité.' });
    appointment.status = 'accepted';
    appointment.meetingDate = meetingDate;
    appointment.decidedAt = new Date();
    appointment.admin = req.user._id;
    await appointment.save();
    // Notify user
    const { notifyUser } = require('../utils/notificationUtils');
    await notifyUser(
      appointment.user,
      `Votre demande de rendez-vous pour le bien "${appointment.property?.title || ''}" a été acceptée. Date du rendez-vous : ${new Date(meetingDate).toLocaleString('fr-FR')}`,
      'appointment_accepted'
    );
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'acceptation du rendez-vous.', error: err.message });
  }
};

// PATCH /api/appointments/:id/deny - Admin denies an appointment
exports.denyAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const { id } = req.params;
    const { denialReason } = req.body;
    if (!denialReason) return res.status(400).json({ success: false, message: 'Motif du refus requis.' });
    const appointment = await Appointment.findById(id).populate('property');
    if (!appointment) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé.' });
    if (appointment.status !== 'pending') return res.status(400).json({ success: false, message: 'Rendez-vous déjà traité.' });
    appointment.status = 'denied';
    appointment.denialReason = denialReason;
    appointment.decidedAt = new Date();
    appointment.admin = req.user._id;
    await appointment.save();
    // Notify user
    const { notifyUser } = require('../utils/notificationUtils');
    await notifyUser(
      appointment.user,
      `Votre demande de rendez-vous pour le bien "${appointment.property?.title || ''}" a été refusée. Motif : ${denialReason}`,
      'appointment_denied'
    );
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors du refus du rendez-vous.', error: err.message });
  }
};
// GET /api/appointments (admin) - List all appointments with user and property info
exports.getAllAppointments = async (req, res) => {
  try {
    // Only allow admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const appointments = await Appointment.find()
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'title type city price status');
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des rendez-vous.', error: err.message });
  }
};

// GET /api/appointments/pending-count - Admin: count pending appointments
exports.getPendingCount = async (req, res) => {
  try {
    // Only allow admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const count = await Appointment.countDocuments({ status: 'pending' });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors du comptage.', error: err.message });
  }
};
const Appointment = require('../models/Appointment');
const Property = require('../models/Property');
const User = require('../models/User');
const { dispatchAdminNotification } = require('../utils/notificationUtils');

// POST /api/appointments - User requests a rendez-vous
exports.requestAppointment = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    console.log('[APPOINTMENT DEBUG] Request body:', req.body);
    console.log('[APPOINTMENT DEBUG] Auth user:', req.user);
    if (!propertyId) return res.status(400).json({ success: false, message: 'Property ID requis.' });
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Bien non trouvé.' });
    // Prevent duplicate pending requests for same user/property
    const existing = await Appointment.findOne({ user: req.user._id, property: propertyId, status: 'pending' });
    if (existing) return res.status(409).json({ success: false, message: 'Demande déjà en attente.' });
    const appointment = await Appointment.create({
      user: req.user._id,
      property: propertyId,
      message: message || '',
    });
    
    // Get user name for notification
    const userName = req.user.firstName && req.user.lastName 
      ? `${req.user.firstName} ${req.user.lastName}`
      : req.user.email;
    
    // Notify all admins
    await dispatchAdminNotification(
      `Nouvelle demande de rendez-vous pour le bien "${property.title}", par ${userName}, rendez-vous #${appointment._id}`,
      'appointment_request'
    );
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    console.error('[APPOINTMENT ERROR]', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la demande de rendez-vous.', error: err.message, stack: err.stack });
  }
};
