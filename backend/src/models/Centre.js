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

  // Buscar un centre per ID incloent els seus tallers, professors i alumnat/responsables
  findById: async (id) => {
    try {
      // 1. Dades bàsiques del centre
      const [rows] = await db.query("SELECT * FROM centres WHERE id = ?", [id]);
      if (rows.length === 0) return null;

      // 2. Tallers assignats al centre
      const [tallers] = await db.query(`
        SELECT t.titol, pd.estat 
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE p.centre_id = ? AND pd.estat = 'ASSIGNADA'
      `, [id]);

      // 3. Professors vinculats directament al centre (Taula 'professors')
      const [professors] = await db.query(`
        SELECT id, nom, cognoms 
        FROM professors 
        WHERE centre_id = ?
      `, [id]);

      // 4. Responsables de grup i recompte d'alumnes (Taula 'peticio_detalls')
      // Això extreu qui gestiona el taller i quants alumnes porta segons la petició
      const [responsables_grups] = await db.query(`
        SELECT DISTINCT pd.docent_nom as nom, pd.num_participants as n_alumnes, t.titol as taller
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE p.centre_id = ? AND pd.docent_nom IS NOT NULL
      `, [id]);

      // Retornem l'objecte complet per al frontend
      return { 
        ...rows[0], 
        tallers, 
        professors, 
        responsables_grups 
      };
    } catch (error) {
      console.error("Error a Centre.findById:", error);
      throw error;
    }
  },

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