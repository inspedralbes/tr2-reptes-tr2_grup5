//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM ELS CONTROLADORS D'ADMIN ---
const tallersController = require("../controllers/admin/tallersController");
const centresController = require("../controllers/admin/centresController");
const checklistController = require("../controllers/admin/checklistConfigController");
const peticionsController = require("../controllers/admin/peticionsController");
const usuarisController = require("../controllers/admin/usuarisController");

//--- RUTES PER A TALLERS ---
// URL base: /api/admin/tallers
router.get("/tallers", tallersController.getAllTallers);
router.post("/tallers", tallersController.createTaller);
router.put("/tallers/:id", tallersController.updateTaller);
router.delete("/tallers/:id", tallersController.deleteTaller);

//--- RUTES PER A CENTRES ---
// URL base: /api/admin/centres
router.get("/centres", centresController.getAllCentres);
router.post("/centres", centresController.createCentre);
router.put("/centres/:id", centresController.updateCentre);
router.delete("/centres/:id", centresController.deleteCentre);

//--- RUTES PER A SOL·LICITUDS DE TALLERS (Peticions) ---
// URL base: /api/admin/peticions
router.get("/peticions", peticionsController.getAll);
router.get("/peticions/:id", peticionsController.getById);
router.put("/peticions/:id/estat", peticionsController.updateEstat);
// Actualitzar l'estat d'un taller individual dins d'una petició
router.put("/peticions/:peticioId/tallers/:tallerId/estat", peticionsController.updateTallerEstat);
router.post("/peticions/assignar", peticionsController.assignarTallerAInstitut);
// Obtenir grups (assignacions) disponibles per un taller — útil per seleccionar assignacio_taller_id
router.get("/peticions/tallers/:tallerId/grups", peticionsController.getGrupsPerTaller);
router.delete("/peticions/:id", peticionsController.delete);

//--- RUTES PER CONFIGURACIÓ CHECKLIST ---
// URL base: /api/admin/checklist-config
router.get("/checklist-config", checklistController.getAllChecklist);
router.post("/checklist-config", checklistController.createChecklistStep);
router.put("/checklist-config/:id", checklistController.updateChecklistStep);
router.delete("/checklist-config/:id", checklistController.deleteChecklistStep);

// --- RUTA: llistar usuaris ---
router.get("/usuaris", usuarisController.getAllUsers);


module.exports = router;
