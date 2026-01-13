const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do lab é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },

  descricao: {
    type: String,
    trim: true,
    maxlength: [1000, 'Descrição não pode exceder 1000 caracteres']
  },

  localizacao: {
    type: String,
    trim: true,
    required: [true, 'Localização é obrigatória']
  },

  fotoUrl: {
    type: String,
    default: null // URL da foto após upload
  },

  // Administrador responsável pelo lab
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lab deve ter um administrador']
  },

  // Equipamentos disponíveis no lab
  equipamentos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],

  // Dias em que o lab não pode ser agendado
  diasBloqueados: [{
    data: Date,
    motivo: {
      type: String,
      default: 'Manutenção'
    }
  }],

  // Horários de funcionamento (fixo: 08:00 - 18:00)
  horarioAbertura: {
    type: String,
    default: '08:00'
  },

  horarioFechamento: {
    type: String,
    default: '18:00'
  },

  // Dias da semana em que funciona (opcional)
  diasFuncionamento: [{
    type: String,
    enum: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
    default: ['segunda', 'terça', 'quarta', 'quinta', 'sexta']
  }],

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
  },

  dataUltimoAgendamento: Date
});

// Atualizar dataAtualizacao antes de salvar
labSchema.pre('save', function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

module.exports = mongoose.model('Lab', labSchema);
