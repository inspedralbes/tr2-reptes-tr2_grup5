// --- CRIDEM A LA BASE DE DADES ---
const db = require("../config/db");

// 1. GET: Obtenir tots els tallers
const getAllTallers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Tallers");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllTallers };
