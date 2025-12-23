// src/controllers/serviceController.js
const Service = require('../models/Service');

// @desc    Obter todos os serviços
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, activeOnly } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    
    const services = await Service.find(query).populate('professional', 'name email');
    
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar serviços.'
    });
  }
};

// @desc    Obter serviço por ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('professional', 'name email phone');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar serviço.'
    });
  }
};

// @desc    Criar serviço (apenas admin)
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, description, duration, price, category, professional } = req.body;
    
    const service = await Service.create({
      name,
      description,
      duration,
      price,
      category,
      professional
    });
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar serviço.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Atualizar serviço (apenas admin)
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const { name, description, duration, price, category, professional, isActive } = req.body;
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (duration) service.duration = duration;
    if (price) service.price = price;
    if (category) service.category = category;
    if (professional !== undefined) service.professional = professional;
    if (isActive !== undefined) service.isActive = isActive;
    
    await service.save();
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar serviço.'
    });
  }
};

// @desc    Deletar serviço (apenas admin)
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    await service.deleteOne();
    
    res.json({
      success: true,
      message: 'Serviço removido com sucesso.'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar serviço.'
    });
  }
};

// @desc    Obter categorias de serviços
// @route   GET /api/services/categories
// @access  Public
const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar categorias.'
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceCategories
};