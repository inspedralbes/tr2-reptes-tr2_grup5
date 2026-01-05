//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM ELS CONTROLADORS DE CENTRE ---
const tallersController = require("../controllers/centres/tallersController");

//--- RUTES PER A TALLERS (VISTA CENTRE) ---
// URL base: /api/centre/tallers
router.get("/tallers", tallersController.getAllTallersDisponibles);

//--- RUTES PER GESTIONAR ALUMNES ---
const alumnesController = require("../controllers/alumnes/alumnesController");
// URL base: /api/centre/alumnes (Gestionat pel centre)
router.post("/alumnes", alumnesController.createAlumne);

module.exports = router;

