// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  updatePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../utils/validators');

// Rotas públicas
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Rotas protegidas
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

module.exports = router;