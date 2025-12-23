// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService,
  getServiceCategories 
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { serviceValidator } = require('../utils/validators');

// Rotas públicas
router.get('/', getServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);

// Rotas protegidas (apenas admin)
router.use(protect);
router.post('/', authorize('admin'), serviceValidator, validate, createService);
router.put('/:id', authorize('admin'), serviceValidator, validate, updateService);
router.delete('/:id', authorize('admin'), deleteService);

module.exports = router;