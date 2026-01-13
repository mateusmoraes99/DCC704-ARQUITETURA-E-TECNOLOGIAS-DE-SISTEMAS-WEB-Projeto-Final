const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do equipamento é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },

  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode exceder 500 caracteres']
  },

  // Lab ao qual este equipamento pertence
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: [true, 'Equipamento deve estar associado a um lab']
  },

  // Quantidade de unidades disponíveis
  quantidade: {
    type: Number,
    default: 1,
    min: [1, 'Quantidade mínima é 1']
  },

  ativo: {
    type: Boolean,
    default: true
  },

  dataCriacao: {
    type: Date,
    default: Date.now
  },

  dataAtualizacao: {
    type: Date,
    default: Date.now
  }
});

// Atualizar dataAtualizacao antes de salvar
equipmentSchema.pre('save', function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

module.exports = mongoose.model('Equipment', equipmentSchema);
