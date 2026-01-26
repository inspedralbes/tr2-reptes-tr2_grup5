// ======================================
// Importem les dependències
// ======================================

const express = require('express');
const router = express.Router();

const tallersController = require('../controllers/professors/tallersController');
const alumnesController = require('../controllers/professors/alumnesController');
const assistenciaController = require('../controllers/professors/assistenciaController');

const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

// ======================================
// Definició de l'Esquema
// ======================================

// Rutes de professors: Gestiona les rutes de l'API per als professors

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Middleware global per a professors ---
// Totes les rutes de professors requereixen autenticació i rol PROFESSOR
router.use(verifyToken);
router.use(verifyRole(['PROFESSOR']));

// A) --- Rutes de tallers ---
router.get('/tallers', tallersController.getTallersAssignats);

// A) --- Rutes d'alumnes ---
router.get('/tallers/:id/alumnes', alumnesController.getAlumnes);
router.post('/tallers/:id/alumnes', alumnesController.addAlumne);
router.delete('/tallers/:id/alumnes/:studentId', alumnesController.deleteAlumne);
router.put('/tallers/:id/alumnes/:studentId/avaluacio', alumnesController.saveReview);

// A) --- Rutes d'assistència ---
router.get('/assistencia/:id', assistenciaController.getAssistencia);
router.post('/assistencia', assistenciaController.saveAssistencia);
router.put('/assistencia/:id', assistenciaController.updateStatus);

module.exports = router;
