// ======================================
// Importem les dependències
// ======================================

const express = require("express");
const router = express.Router();

const solicitudRegistreController = require("../controllers/solicitudRegistreController");
const verifyToken = require("../middleware/authMiddleware");

// ======================================
// Definició de l'Esquema
// ======================================

// Rutes de sol·licituds de registre: Gestiona les rutes de l'API per a sol·licituds de registre de centres

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Rutes per a sol·licituds de registre ---
// URL base: /api/solicituds-registre
router.post("/", solicitudRegistreController.create);
router.get("/", verifyToken, solicitudRegistreController.getAll);
router.get("/:id", verifyToken, solicitudRegistreController.getById);
router.put("/:id", verifyToken, solicitudRegistreController.update);
router.delete("/:id", verifyToken, solicitudRegistreController.delete);

module.exports = router;
