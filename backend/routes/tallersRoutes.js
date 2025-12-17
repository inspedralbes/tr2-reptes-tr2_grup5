//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM EL CONTROLADOR DE TALLERS ---
const tallersController = require("../controllers/tallersController");

//--- DEFINIM LES RUTES DE TALLERS ---
// GET (http://localhost:1700/api/tallers) --> Obtenir tots els tallers
router.get("/", tallersController.getAllTallers);

module.exports = router;
