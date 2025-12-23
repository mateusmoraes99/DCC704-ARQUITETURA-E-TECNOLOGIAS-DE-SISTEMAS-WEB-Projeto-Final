const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cliente é obrigatório"]
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Serviço é obrigatório"]
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    date: {
      type: Date,
      required: [true, "Data é obrigatória"]
    },
    startTime: {
      type: String,
      required: [true, "Horário de início é obrigatório"],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (use HH:MM)"]
    },
    endTime: {
      type: String
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notas não podem exceder 500 caracteres"]
    }
  },
  {
    timestamps: true
  }
);

// Calcular endTime automaticamente
appointmentSchema.pre("save", async function (next) {
  if (this.isModified("service") || this.isModified("startTime")) {
    try {
      const Service = mongoose.model("Service");
      const service = await Service.findById(this.service);
      
      if (service) {
        const [hours, minutes] = this.startTime.split(":").map(Number);
        const startDate = new Date(this.date);
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + service.duration * 60000);
        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
        this.endTime = endHours + ":" + endMinutes;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Índices para performance
appointmentSchema.index({ date: 1, startTime: 1 });
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ professional: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;