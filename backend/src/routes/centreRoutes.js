// ======================================
// Importem les dependències
// ======================================

const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const tallersController = require("../controllers/centres/tallersController");
const peticionsController = require("../controllers/centres/peticionsController");
const professoratController = require("../controllers/centres/professoratController");
const perfilController = require("../controllers/centres/perfilController");

// ======================================
// Definició de l'Esquema
// ======================================

// Rutes de centre: Gestiona les rutes de l'API per als centres educatius

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Ruta per al perfil del centre ---
// URL base: /api/centre/perfil
router.get("/perfil", verifyToken, perfilController.getPerfil);

// A) --- Rutes per a tallers (vista centre) ---
// URL base: /api/centre/tallers
router.get("/tallers", tallersController.getAllTallersDisponibles);
router.get("/assignacions", verifyToken, tallersController.getMevesAssignacions);
router.get('/assignacions/:id', verifyToken, tallersController.getAssignacioById);    

// A) --- Rutes per a professorat ---
// URL base: /api/centre/professors
router.get("/professors", verifyToken, professoratController.getMeusProfessors);
router.post('/professors', verifyToken, professoratController.createProf);
router.put('/professors/:id', verifyToken, professoratController.updateProfessor);
router.delete('/professors/:id', verifyToken, professoratController.deleteProfessor);

// A) --- Rutes per a sol·licituds de tallers ---
// URL base: /api/centre/peticions
router.post("/peticions", verifyToken, peticionsController.createPeticio);
router.get("/peticions", verifyToken, peticionsController.getMevesPeticions);

module.exports = router;