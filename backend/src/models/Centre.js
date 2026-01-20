const db = require("../config/db");

const Centre = {
  // Obtenir tots els centres amb els seus tallers assignats
  getAll: async () => {
    try {
      // 1. Obtenim tots els centres
      const [centres] = await db.query("SELECT * FROM centres");
      
      // 2. Obtenim els tallers fent el camí correcte per la base de dades:
      // centres -> peticions -> peticio_detalls -> tallers
      const [tallers] = await db.query(`
        SELECT p.centre_id, t.titol, pd.estat 
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE pd.estat = 'ASSIGNADA'
      `);

      // 3. Combinem les dades
      return centres.map(c => {
        return {
          ...c,
          tallers: tallers.filter(t => t.centre_id === c.id)
        };
      });
    } catch (error) {
      console.error("Error a Centre.getAll:", error);
      throw error; 
    }
  },

  // Buscar un centre per ID incloent els seus tallers
  findById: async (id) => {
    try {
      const [rows] = await db.query("SELECT * FROM centres WHERE id = ?", [id]);
      if (rows.length === 0) return null;

      const [tallers] = await db.query(`
        SELECT t.titol, pd.estat 
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE p.centre_id = ? AND pd.estat = 'ASSIGNADA'
      `, [id]);

      return { ...rows[0], tallers };
    } catch (error) {
      console.error("Error a Centre.findById:", error);
      throw error;
    }
  },

  // La resta de mètodes (create, update, delete, findByUserId) es mantenen igual...
  create: async (data) => {
    const sql = `
      INSERT INTO centres 
      (codi_centre, nom_centre, adreca, municipi, telefon, email_oficial, nom_coordinador, es_primera_vegada, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      data.codi_centre || `TEMP-${Date.now()}`,
      data.nom_centre,
      data.adreca || null,
      data.municipi || null,
      data.telefon || null,
      data.email_oficial || null,
      data.nom_coordinador || null,
      data.es_primera_vegada || 0,
      data.user_id || null
    ]);
    return result.insertId;
  },

  update: async (id, data) => {
    const sql = `
      UPDATE centres SET 
      codi_centre = ?, nom_centre = ?, adreca = ?, municipi = ?,
      telefon = ?, email_oficial = ?, nom_coordinador = ?,
      es_primera_vegada = ?, user_id = ?
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [
      data.codi_centre, data.nom_centre, data.adreca, data.municipi,
      data.telefon, data.email_oficial, data.nom_coordinador,
      data.es_primera_vegada, data.user_id, id
    ]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM centres WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  findByUserId: async (user_id) => {
    const [rows] = await db.query("SELECT * FROM centres WHERE user_id = ?", [user_id]);
    return rows[0];
  }
};

module.exports = Centre;