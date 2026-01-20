const db = require("../../config/db");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Centre = require("../../models/Centre");

//--- 1. GET: OBTENIR TOTS ELS TALLERS DISPONIBLES PER A CENTRES ---
const getAllTallersDisponibles = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tallers WHERE actiu = 1");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//--- 2. GET: OBTENIR Talls ASSIGNATS AL CENTRE LOGUEJAT ---
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
