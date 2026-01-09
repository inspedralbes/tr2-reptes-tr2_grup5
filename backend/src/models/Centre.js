const db = require("../config/db");

// Model de Centre
// Encarna la lògica d'accés a dades per a la taula 'centres'
const Centre = {
  // Obtenir tots els centres
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM centres");
    return rows;
  },

  // Crear un nou centre
  create: async (data) => {
    const {
      nom,
      id_responsable,
      correu,
      ubicacio,
      es_primera_vegada
    } = data;

    const sql = `
      INSERT INTO centres 
      (codi_centre, nom_centre, adreca, municipi, telefon, email_oficial, nom_coordinador, es_primera_vegada, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      data.codi_centre || `TEMP-${Date.now()}`, // Fallback temporal per evitar error SQL
      data.nom_centre || data.nom,
      data.adreca || null,
      data.municipi || data.ubicacio || null,
      data.telefon || null,
      data.email_oficial || data.correu || null,
      data.nom_coordinador || null,
      data.es_primera_vegada || 0,
      data.user_id || data.id_responsable || null
    ]);

    return result.insertId;
  },

  // Actualitzar un centre per ID
  update: async (id, data) => {
    const sql = `
      UPDATE centres SET 
      codi_centre = ?,
      nom_centre = ?, 
      adreca = ?,
      municipi = ?,
      telefon = ?,
      email_oficial = ?,
      nom_coordinador = ?,
      es_primera_vegada = ?,
      user_id = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      data.codi_centre,
      data.nom_centre || data.nom,
      data.adreca,
      data.municipi || data.ubicacio,
      data.telefon,
      data.email_oficial || data.correu,
      data.nom_coordinador,
      data.es_primera_vegada,
      data.user_id || data.id_responsable,
      id
    ]);

    return result.affectedRows > 0;
  },

  // Eliminar un centre per ID
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM centres WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Buscar un centre per ID
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM centres WHERE id = ?", [id]);
    return rows[0];
  },

  // Buscar un centre per User ID
  findByUserId: async (user_id) => {
    const [rows] = await db.query("SELECT * FROM centres WHERE user_id = ?", [user_id]);
    return rows[0];
  }
};

module.exports = Centre;
