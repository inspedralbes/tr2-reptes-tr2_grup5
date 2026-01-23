//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM ELS CONTROLADORS D'ADMIN ---
const tallersController = require("../controllers/admin/tallersController");
const centresController = require("../controllers/admin/centresController");
const checklistController = require("../controllers/admin/checklistConfigController");
const peticionsController = require("../controllers/admin/peticionsController");
const usuarisController = require("../controllers/admin/usuarisController");
const matchingController = require("../controllers/admin/matchingController");
const statsController = require("../controllers/admin/statsController");
const logsController = require("../controllers/admin/logsController");

//--- RUTES PER A TALLERS ---
// URL base: /api/admin/tallers
router.get("/tallers", tallersController.getAllTallers);
router.get("/tallers/:id", tallersController.getTallerById);
router.post("/tallers", tallersController.createTaller);
router.put("/tallers/:id", tallersController.updateTaller);
router.delete("/tallers/:id", tallersController.deleteTaller);

//--- RUTES PER A CENTRES ---
// URL base: /api/admin/centres
router.get("/centres", centresController.getAllCentres);
router.post("/centres", centresController.createCentre);
router.put("/centres/:id", centresController.updateCentre);
router.delete("/centres/:id", centresController.deleteCentre);
router.get("/centres/:id", centresController.getCentreById);

//--- RUTES PER A SOL·LICITUDS DE TALLERS (Peticions) ---
// URL base: /api/admin/peticions
router.get("/peticions", peticionsController.getAll);
router.get("/peticions/:id", peticionsController.getById);
router.put("/peticions/:id/tallers/:taller_id/estat", peticionsController.updateTallerEstat);
router.post("/peticions/assignar", peticionsController.assign);
router.delete("/peticions/:id", peticionsController.delete);

//--- RUTES PER CONFIGURACIÓ CHECKLIST ---
// URL base: /api/admin/checklist-config
router.get("/checklist-config", checklistController.getAllChecklist);
router.post("/checklist-config", checklistController.createChecklistStep);
router.put("/checklist-config/:id", checklistController.updateChecklistStep);
router.delete("/checklist-config/:id", checklistController.deleteChecklistStep);

// --- RUTA: llistar usuaris ---
router.get("/usuaris", usuarisController.getAllUsers);

// --- RUTA: llistar logs ---
router.get("/logs", logsController.getAll);

// --- RUTA: llistar logs ---
router.get("/logs", logsController.getAll);

//--- RUTES PER ASSIGNACIÓ AUTOMÀTICA (Matching) ---
// URL base: /api/admin/matching
router.post("/matching/auto", matchingController.executeAutoAssignment);

// --- RUTES PER A ESTADÍSTIQUES ---
router.get("/stats/dashboard", statsController.getDashboardStats);

module.exports = router;
