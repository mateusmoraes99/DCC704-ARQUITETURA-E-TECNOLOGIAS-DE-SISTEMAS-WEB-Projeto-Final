const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome do serviço é obrigatório"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      required: true,
      min: [5, "Duração mínima é 5 minutos"],
      max: [480, "Duração máxima é 8 horas"],
      default: 30
    },
    price: {
      type: Number,
      required: [true, "Preço é obrigatório"],
      min: [0, "Preço não pode ser negativo"]
    },
    category: {
      type: String,
      enum: ["haircut", "beard", "coloring", "consultation", "other"],
      default: "other"
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;