const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentControllerLabs");
const { protect: authMiddleware } = require("../middleware/auth");

// Rotas públicas
router.get("/labs/available-days", appointmentController.getAvailableDays);

// Rotas protegidas (requerem autenticação)
// Meus agendamentos
router.get("/", authMiddleware, appointmentController.getMyAppointments);

// Agendamentos de um laboratório específico (para labAdmin ver agendamentos de seu lab)
router.get("/labs/:labId/appointments", authMiddleware, appointmentController.getLabAppointments);

// Detalhes do agendamento
router.get("/:id", authMiddleware, appointmentController.getAppointmentById);

// Criar novo agendamento
router.post("/labs/:labId", authMiddleware, appointmentController.createAppointment);

// Confirmar agendamento (labAdmin)
router.put("/:id/confirm", authMiddleware, appointmentController.confirmAppointment);

// Rejeitar agendamento (labAdmin)
router.put("/:id/reject", authMiddleware, appointmentController.rejectAppointment);

// Cancelar agendamento (cliente ou labAdmin)
router.delete("/:id", authMiddleware, appointmentController.cancelAppointment);

module.exports = router;
