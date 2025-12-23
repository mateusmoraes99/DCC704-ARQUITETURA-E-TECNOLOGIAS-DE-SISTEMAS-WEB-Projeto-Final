// src/utils/validators.js
const { body } = require('express-validator');

// Validações de autenticação
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  body('role')
    .optional()
    .isIn(['client', 'admin', 'professional']).withMessage('Role inválida'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]+$/).withMessage('Telefone inválido')
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido'),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
];

// Validações de serviço
const serviceValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome do serviço é obrigatório'),
  
  body('description')
    .optional()
    .trim(),
  
  body('duration')
    .notEmpty().withMessage('Duração é obrigatória')
    .isInt({ min: 5, max: 480 }).withMessage('Duração deve ser entre 5 e 480 minutos'),
  
  body('price')
    .notEmpty().withMessage('Preço é obrigatório')
    .isFloat({ min: 0 }).withMessage('Preço não pode ser negativo'),
  
  body('category')
    .optional()
    .isIn(['haircut', 'beard', 'coloring', 'consultation', 'other'])
    .withMessage('Categoria inválida'),
  
  body('professional')
    .optional()
    .isMongoId().withMessage('ID do profissional inválido'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive deve ser booleano')
];

// Validações de agendamento
const appointmentValidator = [
  body('service')
    .notEmpty().withMessage('Serviço é obrigatório')
    .isMongoId().withMessage('ID do serviço inválido'),
  
  body('professional')
    .optional()
    .isMongoId().withMessage('ID do profissional inválido'),
  
  body('date')
    .notEmpty().withMessage('Data é obrigatória')
    .isISO8601().withMessage('Data inválida. Use formato YYYY-MM-DD'),
  
  body('startTime')
    .notEmpty().withMessage('Horário de início é obrigatório')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido (use HH:MM)'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notas não podem exceder 500 caracteres')
];

module.exports = {
  registerValidator,
  loginValidator,
  serviceValidator,
  appointmentValidator
};