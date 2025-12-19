//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();

//--- IMPORTEM EL CONTROLADOR DE TALLERS ---
const tallersController = require("../controllers/tallersController");

//--- DEFINIM LES RUTES DE TALLERS ---

// 1. GET Obtenir tots --> http://localhost:1700/api/tallers
router.get("/", tallersController.getAllTallers);

// 2. POST Crear nou taller --> http://localhost:1700/api/tallers
router.post("/", tallersController.createTaller);

// 3. PUT Actualitzar taller --> http://localhost:1700/api/tallers/5
router.put("/:id", tallersController.updateTaller);

// 4. DELETE Eliminar taller --> http://localhost:1700/api/tallers/5
router.delete("/:id", tallersController.deleteTaller);

module.exports = router;
