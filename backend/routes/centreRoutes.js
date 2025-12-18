//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM ELS CONTROLADORS DE CENTRE ---
const tallersController = require("../controllers/centre/tallersController");

//--- RUTES PER A TALLERS (VISTA CENTRE) ---
// URL base: /api/centre/tallers
router.get("/tallers", tallersController.getAllTallersDisponibles);

module.exports = router;