const db = require("../config/db");

const Taller = {
  getAll: async (filter = 'active') => {
    let sql = "SELECT * FROM tallers";
    const params = [];

    if (filter === 'active') {
      sql += " WHERE actiu = 1";
    } else if (filter === 'archived') {
      sql += " WHERE actiu = 0";
    }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  create: async (data) => {
    const {
      titol,
      descripcio,
      sector,
      modalitat,
      trimestres_disponibles,
      places_maximes,
      adreca,
      ubicacio
    } = data;

    // INSERT: Afegim places_restants igual a places_maximes
    const sql = `
      INSERT INTO tallers 
      (titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, places_restants, adreca, ubicacio, actiu) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [
      titol,
      descripcio || null,
      sector,
      modalitat,
      trimestres_disponibles || null,
      places_maximes || 12,
      places_maximes || 12, // Inicialitzem places_restants
      adreca || null,
      ubicacio || null
    ]);

    return result.insertId;
  },

  update: async (id, data) => {
    const {
      titol,
      descripcio,
      sector,
      modalitat,
      trimestres_disponibles,
      places_maximes,
      adreca,
      ubicacio,
      actiu
    } = data;

    const sql = `
      UPDATE tallers SET 
      titol = ?, 
      descripcio = ?, 
      sector = ?, 
      modalitat = ?, 
      trimestres_disponibles = ?, 
      places_maximes = ?, 
      adreca = ?, 
      ubicacio = ?,
      actiu = COALESCE(?, actiu)
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      titol,
      descripcio,
      sector,
      modalitat,
      trimestres_disponibles,
      places_maximes,
      adreca,
      ubicacio,
      actiu,
      id
    ]);

    return result.affectedRows > 0;
  },

  // --- NOUS MÈTODES PER A LA GESTIÓ AUTOMÀTICA DE PLACES ---
  restarPlaces: async (id, quantitat) => {
    const sql = "UPDATE tallers SET places_restants = places_restants - ? WHERE id = ?";
    const [result] = await db.query(sql, [quantitat, id]);
    return result.affectedRows > 0;
  },

  sumarPlaces: async (id, quantitat) => {
    const sql = "UPDATE tallers SET places_restants = places_restants + ? WHERE id = ?";
    const [result] = await db.query(sql, [quantitat, id]);
    return result.affectedRows > 0;
  },
  // -------------------------------------------------------

  archive: async (id) => {
    const [result] = await db.query("UPDATE tallers SET actiu = 0 WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM tallers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM tallers WHERE id = ?", [id]);
    return rows[0];
  },

  hasDependencies: async (id) => {
    const [peticions] = await db.query("SELECT COUNT(*) as c FROM peticio_detalls WHERE taller_id = ?", [id]);
    return peticions[0].c > 0;
  }
};

module.exports = Taller;