const express = require('express');
const router = express.Router();
const centresController = require('../controllers/centresController');

// Definim les rutes
router.get('/', centresController.getAllCentres); // Obtenir tots els centres

module.exports = router;