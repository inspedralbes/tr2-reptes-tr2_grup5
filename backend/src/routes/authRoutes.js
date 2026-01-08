const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta per registrar nous usuaris (encriptant password)
router.post('/register', authController.register);

// Ruta per fer login (verificant password)
router.post('/login', authController.login);

module.exports = router;
