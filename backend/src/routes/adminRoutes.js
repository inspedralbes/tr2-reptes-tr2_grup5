// ======================================
// Importem les dependències
// ======================================

const express = require("express");
const router = express.Router();

const tallersController = require("../controllers/admin/tallersController");
const centresController = require("../controllers/admin/centresController");
const checklistController = require("../controllers/admin/checklistConfigController");
const peticionsController = require("../controllers/admin/peticionsController");
const usuarisController = require("../controllers/admin/usuarisController");
const matchingController = require("../controllers/admin/matchingController");
const statsController = require("../controllers/admin/statsController");

// ======================================
// Definició de l'Esquema
// ======================================

// Rutes d'administració: Gestiona les rutes de l'API per a l'administrador

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Rutes per a tallers ---
// URL base: /api/admin/tallers
router.get("/tallers", tallersController.getAllTallers);
router.get("/tallers/:id", tallersController.getTallerById);
router.post("/tallers", tallersController.createTaller);
router.put("/tallers/:id", tallersController.updateTaller);
router.delete("/tallers/:id", tallersController.deleteTaller);

// A) --- Rutes per a centres ---
// URL base: /api/admin/centres
router.get("/centres", centresController.getAllCentres);
router.post("/centres", centresController.createCentre);
router.put("/centres/:id", centresController.updateCentre);
router.delete("/centres/:id", centresController.deleteCentre);
router.get("/centres/:id", centresController.getCentreById);

// A) --- Rutes per a sol·licituds de tallers (Peticions) ---
// URL base: /api/admin/peticions
router.get("/peticions", peticionsController.getAll);
router.get("/peticions/:id", peticionsController.getById);
router.put("/peticions/:id/tallers/:taller_id/estat", peticionsController.updateTallerEstat);
router.post("/peticions/assignar", peticionsController.assign);
router.delete("/peticions/:id", peticionsController.delete);

// A) --- Rutes per configuració checklist ---
// URL base: /api/admin/checklist-config
router.get("/checklist-config", checklistController.getAllChecklist);
router.post("/checklist-config", checklistController.createChecklistStep);
router.put("/checklist-config/:id", checklistController.updateChecklistStep);
router.delete("/checklist-config/:id", checklistController.deleteChecklistStep);

// A) --- Ruta per llistar usuaris ---
router.get("/usuaris", usuarisController.getAllUsers);

// A) --- Rutes per assignació automàtica (Matching) ---
// URL base: /api/admin/matching
router.post("/matching/auto", matchingController.executeAutoAssignment);

// A) --- Rutes per a estadístiques ---
router.get("/stats/dashboard", statsController.getDashboardStats);

module.exports = router;
