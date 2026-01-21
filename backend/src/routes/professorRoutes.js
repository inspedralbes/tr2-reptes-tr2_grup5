const express = require('express');
const router = express.Router();
const tallersController = require('../controllers/professors/tallersController');
const alumnesController = require('../controllers/professors/alumnesController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

// Totes les rutes de professors requereixen autenticació i rol PROFESSOR
router.use(verifyToken);
router.use(verifyRole(['PROFESSOR']));

// Rutes de tallers
router.get('/tallers', tallersController.getTallersAssignats);

// Rutes d'alumnes
router.get('/tallers/:id/alumnes', alumnesController.getAlumnes);
router.post('/tallers/:id/alumnes', alumnesController.addAlumne);
router.delete('/tallers/:id/alumnes/:studentId', alumnesController.deleteAlumne);

module.exports = router;
