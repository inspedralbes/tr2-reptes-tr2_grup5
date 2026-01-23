// ======================================
// Importem les dependències
// ======================================

const db = require("../../config/db");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Centre = require("../../models/Centre");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de tallers (centres): Llistar tallers disponibles i assignacions del centre

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els tallers disponibles per a centres ---
const getAllTallersDisponibles = async (req, res) => {
  try {
    // 1. Executem la consulta
    const result = await db.query("SELECT * FROM tallers WHERE actiu = 1");
    const rows = result[0];

    // 2. Retornem les files
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// B) --- Obtenir les assignacions del centre loguejat ---
const getMevesAssignacions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const centre = await Centre.findByUserId(user_id);

    if (!centre) {
      return res.status(404).json({ message: "No s'ha trobat el perfil de centre." });
    }

    const assignacions = await AssignacioTaller.getByCentreId(centre.id);
    res.json(assignacions);
  } catch (error) {
    console.error("Error al obtenir assignacions del centre:", error);
    res.status(500).json({ message: "Error al recuperar les teves assignacions." });
  }
};

module.exports = {
  getAllTallersDisponibles,
  getMevesAssignacions
};
