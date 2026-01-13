const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Cliente que agendou
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuário é obrigatório"]
    },

    // Lab agendado (MUDANÇA: era serviceId, agora labId)
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: [true, "Lab é obrigatório"]
    },

    // Equipamentos que será usado (NOVO)
    equipmentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment"
    }],

    // Datas do agendamento (novo: suporta múltiplos dias)
    datas: [{
      type: Date,
      required: [true, "Datas são obrigatórias"]
    }],

    // Horário (fixo: 08:00-18:00)
    horarioInicio: {
      type: String,
      required: [true, "Horário de início é obrigatório"],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (use HH:MM)"]
    },

    horarioFim: {
      type: String,
      required: [true, "Horário de fim é obrigatório"]
    },

    // Observações do cliente
    observacoes: {
      type: String,
      trim: true,
      maxlength: [500, "Observações não podem exceder 500 caracteres"]
    },

    // Status do agendamento
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },

    // Quem confirmou
    confirmadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Data/motivo cancelamento
    dataCancelamento: Date,
    motivoCancelamento: String,

    dataCriacao: {
      type: Date,
      default: Date.now
    },

    dataAtualizacao: {
      type: Date,
      default: Date.now
    },

    dataConfirmacao: Date
  }
);

// Atualizar dataAtualizacao
appointmentSchema.pre("save", function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

// Índices para performance
appointmentSchema.index({ datas: 1, labId: 1 });
appointmentSchema.index({ usuarioId: 1 });
appointmentSchema.index({ labId: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;