//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM ELS CONTROLADORS D'ADMIN ---
const tallersController = require("../controllers/admin/tallersController");
const centresController = require("../controllers/admin/centresController");

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

module.exports = router;

