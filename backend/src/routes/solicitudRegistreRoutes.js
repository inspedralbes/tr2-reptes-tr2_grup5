const express = require("express");
const router = express.Router();
const solicitudRegistreController = require("../controllers/solicitudRegistreController");
const verifyToken = require("../middleware/authMiddleware");

//--- RUTES PER A SOL·LICITUDS DE REGISTRE ---
// URL base: /api/solicituds-registre
router.post("/", solicitudRegistreController.create);
router.get("/", verifyToken, solicitudRegistreController.getAll);
router.get("/:id", verifyToken, solicitudRegistreController.getById);
router.put("/:id", verifyToken, solicitudRegistreController.update);
router.delete("/:id", verifyToken, solicitudRegistreController.delete);


module.exports = router;
