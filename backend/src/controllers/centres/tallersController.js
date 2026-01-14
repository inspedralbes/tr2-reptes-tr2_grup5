const db = require("../../config/db");

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

module.exports = { 
  getAllTallersDisponibles
};

