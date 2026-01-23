// ======================================
// Importem les dependències
// ======================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ======================================
// Definició de l'Esquema
// ======================================

// Rutes d'autenticació: Gestiona les rutes de l'API per a autenticació d'usuaris

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Rutes per a autenticació ---
// URL base: /api/auth
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
