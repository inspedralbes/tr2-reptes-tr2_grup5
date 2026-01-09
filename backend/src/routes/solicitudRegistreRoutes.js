const express = require("express");
const router = express.Router();
const solicitudRegistreController = require("../controllers/solicitudRegistreController");
const verifyToken = require("../middleware/authMiddleware");

// POST (Public)
router.post("/", solicitudRegistreController.create);

// ADMIN Routes (Protected)
router.get("/", verifyToken, solicitudRegistreController.getAll);
router.get("/:id", verifyToken, solicitudRegistreController.getById);
router.put("/:id", verifyToken, solicitudRegistreController.update);
router.delete("/:id", verifyToken, solicitudRegistreController.delete);

module.exports = router;
