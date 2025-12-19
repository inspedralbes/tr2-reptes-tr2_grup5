const db = require("../../config/db");

// --- 1. GET: Obtenir tots els centres ---
const getAllCentres = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Centres");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. POST: Crear un nou centre ---
const createCentre = async (req, res) => {
  const { 
    nom, 
    id_responsable, 
    correu, 
    ubicacio, 
    es_primera_vegada 
  } = req.body;

  //Comprovem que els camps obligatoris estiguin presents (nom)
  if (!nom) {
    return res.status(400).json({ message: "El nom és obligatori" });
  }

  try { //Provem d'inserir el nou centre a la base de dades
    const sql = `
      INSERT INTO Centres 
      (nom, id_responsable, correu, ubicacio, es_primera_vegada) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      nom, id_responsable || null, correu || null, ubicacio || null, es_primera_vegada || false
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      nom, 
      message: "Centre creat correctament" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. PUT: Actualitzar un centre existent ---
const updateCentre = async (req, res) => {
  const { id } = req.params;
  const { 
    nom, 
    id_responsable, 
    correu, 
    ubicacio, 
    es_primera_vegada 
  } = req.body;

  try {
    const sql = `
      UPDATE Centres SET 
      nom = ?, 
      id_responsable = ?, 
      correu = ?, 
      ubicacio = ?, 
      es_primera_vegada = ?
      WHERE id_centre = ?
    `;

    const [result] = await db.query(sql, [
      nom, id_responsable, correu, ubicacio, es_primera_vegada, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No s'ha trobat el centre per actualitzar" });
    }

    res.json({ message: "Centre actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 4. DELETE: Eliminar un centre ---
const deleteCentre = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM Centres WHERE id_centre = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No s'ha trobat el centre per eliminar" });
    }

    res.json({ message: "Centre eliminat correctament" });
  } catch (error) {
    // Si falla per restricció de clau forana (té sol·licituds assignades), ho capturem
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: "No es pot eliminar el centre perquè té sol·licituds associades." });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getAllCentres,  
  createCentre, 
  updateCentre, 
  deleteCentre 
};

