//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM ELS CONTROLADORS D'ADMIN ---
const tallersController = require("../controllers/admin/tallersController");
const centresController = require("../controllers/admin/centresController");
const checklistController = require("../controllers/admin/checklistConfigController");
const enquestesController = require("../controllers/admin/enquestesController");

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

//--- RUTES PER CONFIGURACIÓ CHECKLIST ---
// URL base: /api/admin/checklist-config
router.get("/checklist-config", checklistController.getAllChecklist);
router.post("/checklist-config", checklistController.createChecklistStep);
router.put("/checklist-config/:id", checklistController.updateChecklistStep);
router.delete("/checklist-config/:id", checklistController.deleteChecklistStep);

// Enquestes (Mestre)
router.get("/enquestes", enquestesController.getAllEnquestes);
router.post("/enquestes", enquestesController.createEnquesta);
router.delete("/enquestes/:id", enquestesController.deleteEnquesta);
// Preguntes (Detall)
router.get("/enquestes/:id/preguntes", enquestesController.getPreguntesByEnquesta);
router.post("/enquestes/:id/preguntes", enquestesController.createPregunta);
router.delete("/preguntes/:id", enquestesController.deletePregunta);

module.exports = router;

