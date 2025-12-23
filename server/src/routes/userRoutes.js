// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getProfessionals 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Todas as rotas protegidas
router.use(protect);

// Rotas para admin
router.get('/', authorize('admin'), getUsers);
router.get('/professionals', getProfessionals);
router.get('/:id', authorize('admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;