const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const appointmentController = require('../controllers/appointmentController');
// GET /api/appointments/user - User: list their own appointments
router.get('/user', protect, appointmentController.getUserAppointments);
// GET /api/appointments/global-status - Global appointment status for all properties
router.get('/global-status', protect, appointmentController.getGlobalAppointmentStatus);

// PATCH /api/appointments/:id/accept - Admin accepts an appointment
router.patch('/:id/accept', protect, appointmentController.acceptAppointment);

// PATCH /api/appointments/:id/deny - Admin denies an appointment
router.patch('/:id/deny', protect, appointmentController.denyAppointment);

// POST /api/appointments - User requests a rendez-vous
router.post('/', protect, appointmentController.requestAppointment);

// GET /api/appointments - Admin: list all appointments
router.get('/', protect, appointmentController.getAllAppointments);

module.exports = router;
