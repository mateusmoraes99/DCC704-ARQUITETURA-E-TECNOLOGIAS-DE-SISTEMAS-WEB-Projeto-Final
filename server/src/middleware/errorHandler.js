// src/middleware/errorHandler.js
class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    // Log para desenvolvimento
    console.error(err);
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Recurso não encontrado';
      error = new ErrorResponse(message, 404);
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = 'Valor duplicado inserido';
      error = new ErrorResponse(message, 400);
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new ErrorResponse(message, 400);
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Token inválido';
      error = new ErrorResponse(message, 401);
    }
  
    if (err.name === 'TokenExpiredError') {
      const message = 'Token expirado';
      error = new ErrorResponse(message, 401);
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Erro no servidor'
    });
  };
  
  module.exports = { errorHandler, ErrorResponse };