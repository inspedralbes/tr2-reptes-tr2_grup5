const db = require("../config/db");

const Taller = {
  // Obté tots els tallers (actius o arxivats)
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

  // --- MÈTODE PER ESTADÍSTIQUES DE TALLERS (Amb Percentatges) ---
  getExtendedStats: async () => {
    // 1. Tallers més realitzats (Top 5) amb % d'impacte sobre el total d'alumnat
    const [mesSolicitats] = await db.query(`
      SELECT 
        t.titol, 
        COUNT(pd.id) as total_peticions, 
        t.sector,
        SUM(pd.num_participants) as alumnes_taller,
        ROUND((SUM(pd.num_participants) / (
          SELECT NULLIF(SUM(num_participants), 0) 
          FROM peticio_detalls 
          WHERE estat = 'ASSIGNADA'
        ) * 100), 1) as percentatge_impacte
      FROM tallers t
      INNER JOIN peticio_detalls pd ON t.id = pd.taller_id
      WHERE pd.estat = 'ASSIGNADA'
      GROUP BY t.id
      ORDER BY total_peticions DESC LIMIT 5
    `);

    // 2. Sector del taller més realitzat
    const [sectorTop] = await db.query(`
      SELECT t.sector, COUNT(pd.id) as total
      FROM tallers t
      INNER JOIN peticio_detalls pd ON t.id = pd.taller_id
      WHERE pd.estat = 'ASSIGNADA'
      GROUP BY t.sector 
      ORDER BY total DESC LIMIT 1
    `);

    // 3. Modalitat més realitzada
    const [modalitatTop] = await db.query(`
      SELECT t.modalitat, COUNT(pd.id) as total
      FROM tallers t
      INNER JOIN peticio_detalls pd ON t.id = pd.taller_id
      WHERE pd.estat = 'ASSIGNADA'
      GROUP BY t.modalitat 
      ORDER BY total DESC LIMIT 1
    `);

    return { 
      mesSolicitats: mesSolicitats || [], 
      sectorTop: sectorTop[0]?.sector || 'Sense dades confirmades', 
      modalitatTop: modalitatTop[0]?.modalitat || 'N/A' 
    };
  },

  // Crear nou taller
  create: async (data) => {
    const { titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, adreca, ubicacio } = data;
    const sql = `
      INSERT INTO tallers 
      (titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, places_restants, adreca, ubicacio, actiu) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const [result] = await db.query(sql, [
      titol, descripcio || null, sector, modalitat, trimestres_disponibles || null,
      places_maximes || 12, places_maximes || 12, adreca || null, ubicacio || null
    ]);
    return result.insertId;
  },

  // Actualitzar taller
  update: async (id, data) => {
    const { titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, adreca, ubicacio, actiu } = data;
    const sql = `
      UPDATE tallers SET titol = ?, descripcio = ?, sector = ?, modalitat = ?, 
      trimestres_disponibles = ?, places_maximes = ?, adreca = ?, ubicacio = ?,
      actiu = COALESCE(?, actiu) WHERE id = ?
    `;
    const [result] = await db.query(sql, [titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, adreca, ubicacio, actiu, id]);
    return result.affectedRows > 0;
  },

  // Gestió de places
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

  // Arxivament i eliminació
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

  // Comprovar si el taller té peticions abans d'esborrar
  hasDependencies: async (id) => {
    const [peticions] = await db.query("SELECT COUNT(*) as c FROM peticio_detalls WHERE taller_id = ?", [id]);
    return peticions[0].c > 0;
  }
};

module.exports = Taller;