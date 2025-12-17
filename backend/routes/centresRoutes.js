//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM EL CONTROLADOR DE CENTRES ---
const centresController = require("../controllers/centresController");

//--- DEFINIM LES RUTES DE CENTRES ---

// 1. GET Obtenir tots --> http://localhost:1700/api/centres
router.get("/", centresController.getAllCentres);

// 2. POST Crear nou centre --> http://localhost:1700/api/centres
router.post("/", centresController.createCentre);

// 3. PUT Actualitzar centre --> http://localhost:1700/api/centres/5
router.put("/:id", centresController.updateCentre);

// 4. DELETE Eliminar centre --> http://localhost:1700/api/centres/5
router.delete("/:id", centresController.deleteCentre);

module.exports = router;

