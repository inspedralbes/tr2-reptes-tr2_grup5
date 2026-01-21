const express = require('express');
const router = express.Router();
const tallersController = require('../controllers/professors/tallersController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

// Totes les rutes de professors requereixen autenticació i rol PROFESSOR
router.use(verifyToken);
router.use(verifyRole(['PROFESSOR']));

// Rutes de tallers
router.get('/tallers', tallersController.getTallersAssignats);

module.exports = router;
