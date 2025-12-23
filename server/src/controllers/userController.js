// src/controllers/userController.js
const User = require('../models/User');

// @desc    Obter todos os usuários (apenas admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários.'
    });
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário.'
    });
  }
};

// @desc    Criar usuário (apenas admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    // Verificar se email já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso.'
      });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      phone
    });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário.'
    });
  }
};

// @desc    Atualizar usuário (apenas admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    // Verificar se novo email já existe (se diferente do atual)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso.'
        });
      }
      user.email = email;
    }
    
    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário.'
    });
  }
};

// @desc    Deletar usuário (apenas admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    // Não permitir deletar a si mesmo
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta.'
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'Usuário removido com sucesso.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário.'
    });
  }
};

// @desc    Obter profissionais
// @route   GET /api/users/professionals
// @access  Private
const getProfessionals = async (req, res) => {
  try {
    const professionals = await User.find({ 
      role: 'professional',
      isActive: true 
    }).select('name email phone');
    
    res.json({
      success: true,
      count: professionals.length,
      data: professionals
    });
  } catch (error) {
    console.error('Get professionals error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar profissionais.'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfessionals
};