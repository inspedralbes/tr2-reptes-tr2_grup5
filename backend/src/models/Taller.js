const db = require("../config/db");

// Model de Taller
// Encarna la lògica d'accés a dades per a la taula 'tallers'
const Taller = {
  // Obtenir tallers amb filtre (per defecte només actius)
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

  // Crear un nou taller
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

    // Per defecte actiu = 1 (definit a BBDD, però podem ser explícits)
    const sql = `
      INSERT INTO tallers 
      (titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, adreca, ubicacio, actiu) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [
      titol,
      descripcio || null,
      sector,
      modalitat,
      trimestres_disponibles || null,
      places_maximes || 12,
      adreca || null,
      ubicacio || null
    ]);

    return result.insertId;
  },

  // Actualitzar un taller per ID
  update: async (id, data) => {
    // Construïm la query dinàmicament o passem tots els camps. 
    // Si data conté 'actiu', també l'actualitzem.

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

    // Recuperem primer les dades actuals per no matxacar amb nulls si no venen tots els camps? 
    // El controller sol passar tots els camps del formulari. Assumim que updates són complets o gestionats al controller.

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

  // Arxivar (Soft Delete)
  archive: async (id) => {
    const [result] = await db.query("UPDATE tallers SET actiu = 0 WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Eliminar físicament (només si no té fills, el controller ho verifica abans o truca a aquest i falla)
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM tallers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Buscar un taller per ID
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM tallers WHERE id = ?", [id]);
    return rows[0];
  },

  // Comprovar si té dependències (assignacions o peticions)
  hasDependencies: async (id) => {
    // 1. Peticions
    const [peticions] = await db.query("SELECT COUNT(*) as c FROM peticio_detalls WHERE taller_id = ?", [id]);
    if (peticions[0].c > 0) return true;

    // 2. Assignacions
    const [assignacions] = await db.query("SELECT COUNT(*) as c FROM assignacions_tallers WHERE taller_id = ?", [id]);
    if (assignacions[0].c > 0) return true;

    return false;
  },

  // Obtenir informació del taller a partir de l'ID d'assignació
  getByAssignacioId: async (assignacioId) => {
    const sql = `
      SELECT t.* 
      FROM tallers t
      JOIN assignacions_tallers at ON t.id = at.taller_id
      WHERE at.id = ?
    `;
    const [rows] = await db.query(sql, [assignacioId]);
    return rows[0];
  }
};

module.exports = Taller;
