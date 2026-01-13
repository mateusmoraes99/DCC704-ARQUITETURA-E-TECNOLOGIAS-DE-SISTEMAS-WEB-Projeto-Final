const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const labController = require("../controllers/labController");
const { protect: authMiddleware } = require("../middleware/auth");

// Configurar multer para upload de fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/labs/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas"));
    }
  }
});

// Rotas públicas
router.get("/", labController.getAllLabs);

// Rotas protegidas - precisa vir ANTES do /:id genérico
router.get("/my-lab/dashboard", authMiddleware, labController.getMyLab);

// Dias bloqueados (públicas para leitura)
router.get("/:id/blocked-days", labController.getBlockedDays);

// Agendamentos de um lab (protegida)
router.get("/:id/appointments", authMiddleware, labController.getLabAppointments);

// Estatísticas do lab (protegida)
router.get("/:id/stats", authMiddleware, labController.getLabStats);

// Criar, Editar, Deletar (protegidas)
router.post("/", authMiddleware, upload.single("foto"), labController.createLab);
router.put("/:id", authMiddleware, upload.single("foto"), labController.updateLab);
router.delete("/:id", authMiddleware, labController.deleteLab);

// Bloquear/Desbloquear dias (protegidas)
router.post("/:id/block-day", authMiddleware, labController.blockDay);
router.delete("/:id/block-day/:data", authMiddleware, labController.unblockDay);

// Rotas públicas específicas - ÚLTIMO (pega qualquer /:id)
router.get("/:id", labController.getLabById);

module.exports = router;
