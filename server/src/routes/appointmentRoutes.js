// src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  getAvailableSlots,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { appointmentValidator } = require('../utils/validators');

// Todas as rotas protegidas
router.use(protect);

// Rotas principais
router.get('/', getAppointments);
router.get('/available-slots', getAvailableSlots);
router.get('/stats', authorize('admin'), getAppointmentStats);
router.get('/:id', getAppointmentById);
router.post('/', appointmentValidator, validate, createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;