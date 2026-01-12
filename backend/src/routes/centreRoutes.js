//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();
const alumnesController = require("../controllers/alumnes/alumnesController");


//--- IMPORTEM MIDDLEWARE D'AUTENTICACIÓ ---
const verifyToken = require("../middleware/authMiddleware");

//--- IMPORTEM ELS CONTROLADORS DE CENTRE ---
const tallersController = require("../controllers/centres/tallersController");
const peticionsController = require("../controllers/centres/peticionsController");

//--- RUTES PER A TALLERS (VISTA CENTRE) ---
// URL base: /api/centre/tallers
router.get("/tallers", tallersController.getAllTallersDisponibles);

//--- RUTES PER A SOL·LICITUDS DE TALLERS ---
// URL base: /api/centre/peticions
router.post("/peticions", verifyToken, peticionsController.createPeticio);
router.get("/peticions", verifyToken, peticionsController.getMevesPeticions);

//--- RUTES PER A GESTIONAR ALUMNES ---
// URL base: /api/centre/alumnes
router.post("/alumnes", verifyToken, alumnesController.createAlumne);



module.exports = router;

