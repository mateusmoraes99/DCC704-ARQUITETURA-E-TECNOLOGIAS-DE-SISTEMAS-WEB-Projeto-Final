const express = require("express");
const router = express.Router({ mergeParams: true });
const equipmentController = require("../controllers/equipmentController");
const { protect: authMiddleware } = require("../middleware/auth");

// Rotas públicas
router.get("/", equipmentController.getLabEquipment);

// CRUD equipamentos (labAdmin ou admin) - protegidas
router.post("/", authMiddleware, equipmentController.createEquipment);
router.put("/:id", authMiddleware, equipmentController.updateEquipment);
router.delete("/:id", authMiddleware, equipmentController.deleteEquipment);

// Público - buscar um equipamento específico (após as rotas de CRUD)
router.get("/:id", equipmentController.getEquipmentById);

module.exports = router;
