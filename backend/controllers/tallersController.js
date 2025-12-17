const db = require("../config/db");

// --- 1. GET: Obtenir tots els tallers ---
const getAllTallers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Tallers");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. POST: Crear un nou taller ---
const createTaller = async (req, res) => {
  const { 
    titol, 
    descripcio, 
    ambit, 
    modalitat, 
    places_min, 
    places_max, 
    adreça_realitzacio, 
    imatge_url 
  } = req.body;

  //Comprovem que els camps obligatoris estiguin presents (titol i modalitat)
  if (!titol || !modalitat) {
    return res.status(400).json({ message: "El títol i la modalitat són obligatoris" });
  }

  try { //Provem d'inserir el nou taller a la base de dades
    const sql = `
      INSERT INTO Tallers 
      (titol, descripcio, ambit, modalitat, places_min, places_max, adreça_realitzacio, imatge_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      titol, descripcio, ambit, modalitat, places_min || 0, places_max || 0, adreça_realitzacio, imatge_url
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      titol, 
      message: "Taller creat correctament" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. PUT: Actualitzar un taller existent ---
const updateTaller = async (req, res) => {
  const { id } = req.params;
  const { 
    titol, 
    descripcio, 
    ambit, 
    modalitat, 
    places_min, 
    places_max, 
    adreça_realitzacio, 
    imatge_url 
  } = req.body;

  try {
    const sql = `
      UPDATE Tallers SET 
      titol = ?, 
      descripcio = ?, 
      ambit = ?, 
      modalitat = ?, 
      places_min = ?, 
      places_max = ?, 
      adreça_realitzacio = ?, 
      imatge_url = ?
      WHERE id_taller = ?
    `;

    const [result] = await db.query(sql, [
      titol, descripcio, ambit, modalitat, places_min, places_max, adreça_realitzacio, imatge_url, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No s'ha trobat el taller per actualitzar" });
    }

    res.json({ message: "Taller actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 4. DELETE: Eliminar un taller ---
const deleteTaller = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM Tallers WHERE id_taller = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No s'ha trobat el taller per eliminar" });
    }

    res.json({ message: "Taller eliminat correctament" });
  } catch (error) {
    // Si falla per restricció de clau forana (té sol·licituds assignades), ho capturem
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: "No es pot eliminar el taller perquè té sol·licituds associades." });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getAllTallers,  
  createTaller, 
  updateTaller, 
  deleteTaller 
};