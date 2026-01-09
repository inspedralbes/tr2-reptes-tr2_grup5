//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM MIDDLEWARE D'AUTENTICACIÓ ---
const verifyToken = require("../middleware/authMiddleware");

//--- IMPORTEM ELS CONTROLADORS DE CENTRE ---
const tallersController = require("../controllers/centres/tallersController");
const peticionsController = require("../controllers/centres/peticionsController");

//--- RUTES PER A TALLERS (VISTA CENTRE) ---
// URL base: /api/centre/tallers
router.get("/tallers", tallersController.getAllTallersDisponibles);

//--- RUTES PER A SOL·LICITUDS DE TALLERS ---
// Crear una nova sol·licitud
router.post("/peticions", verifyToken, peticionsController.createPeticio);
// Veure les meves sol·licituds
router.get("/peticions", verifyToken, peticionsController.getMevesPeticions);

//--- RUTES PER GESTIONAR ALUMNES ---
const alumnesController = require("../controllers/alumnes/alumnesController");
// URL base: /api/centre/alumnes (Gestionat pel centre)
router.post("/alumnes", verifyToken, alumnesController.createAlumne);

module.exports = router;

