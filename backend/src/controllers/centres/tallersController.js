const db = require("../../config/db");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Centre = require("../../models/Centre");

//--- 1. GET: OBTENIR TOTS ELS TALLERS DISPONIBLES PER A CENTRES ---
const getAllTallersDisponibles = async (req, res) => {
  try {
    // Fem la consulta a la taula Tallers
    const [rows] = await db.query("SELECT * FROM tallers");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//--- 2. GET: OBTENIR ASSIGNACIONS DEL CENTRE ---
const getMevesAssignacions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const centre = await Centre.findByUserId(user_id);
    if (!centre) {
      return res.status(404).json({ message: "Centre no trobat" });
    }

    const assignacions = await AssignacioTaller.getAssignacionsByCentreId(centre.id);
    res.json(assignacions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTallersDisponibles,
  getMevesAssignacions
};

