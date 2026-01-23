//--- DECLAREM ELS MÒDULS NECESSARIS ---
const express = require("express");
const router = express.Router();


//--- IMPORTEM MIDDLEWARE D'AUTENTICACIÓ ---
const verifyToken = require("../middleware/authMiddleware");

//--- IMPORTEM ELS CONTROLADORS DE CENTRE ---
const tallersController = require("../controllers/centres/tallersController");
const peticionsController = require("../controllers/centres/peticionsController");
const professoratController = require("../controllers/centres/professoratController");

//--- RUTA PER AL PERFIL DEL CENTRE ---
// URL base: /api/centre/perfil
router.get("/perfil", verifyToken, async (req, res) => {
    try {
        const Centre = require("../models/Centre");
        const centre = await Centre.findByUserId(req.user.id);
        if (!centre) return res.status(404).json({ message: "Centre no trobat" });
        res.json(centre);
    } catch (error) {
        res.status(500).json({ message: "Error al obtenir el perfil" });
    }
});

//--- RUTES PER A TALLERS (VISTA CENTRE) ---

// URL base: /api/centre/tallers
router.get("/tallers", tallersController.getAllTallersDisponibles);
router.get("/assignacions", verifyToken, tallersController.getMevesAssignacions);

//--- RUTES PER A PROFESSORAT ---
// URL base: /api/centre/professors
router.get("/professors", verifyToken, professoratController.getMeusProfessors);
router.post('/professors', verifyToken, professoratController.createProf);
router.put('/professors/:id', verifyToken, professoratController.updateProfessor);
router.delete('/professors/:id', verifyToken, professoratController.deleteProfessor);

//--- RUTES PER A SOL·LICITUDS DE TALLERS ---
// URL base: /api/centre/peticions
router.post("/peticions", verifyToken, peticionsController.createPeticio);
router.get("/peticions", verifyToken, peticionsController.getMevesPeticions);

module.exports = router;

