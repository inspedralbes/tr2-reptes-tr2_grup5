// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Centre: Gestiona les operacions relacionades amb la taula 'centres'

// ======================================
// Declaracions de funcions
// ======================================

const Centre = {
  // A) --- Obtenir tots els centres amb els seus tallers assignats ---
  getAll: async () => {
    try {
      // 1. Obtenim tots els centres
      const resultCentres = await db.query("SELECT * FROM centres");
      const centres = resultCentres[0];
      
      // 2. Obtenim els tallers assignats fent el camí correcte per la base de dades
      const resultTallers = await db.query(`
        SELECT p.centre_id, t.titol, pd.estat 
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE pd.estat = 'ASSIGNADA'
      `);
      const tallers = resultTallers[0];

      // 3. Creem un array per als resultats finals
      const resultat = [];
      
      // 4. Recorrem cada centre
      for (let i = 0; i < centres.length; i++) {
        const centre = centres[i];
        
        // 5. Creem un objecte nou per al centre
        const centreComplet = {};
        
        // 6. Copiem totes les propietats del centre manualment
        for (const clau in centre) {
          centreComplet[clau] = centre[clau];
        }
        
        // 7. Filtrem els tallers que pertanyen a aquest centre
        const tallersCentre = [];
        for (let j = 0; j < tallers.length; j++) {
          const taller = tallers[j];
          if (taller.centre_id === centre.id) {
            tallersCentre.push(taller);
          }
        }
        
        // 8. Afegim els tallers al centre
        centreComplet.tallers = tallersCentre;
        
        // 9. Afegim el centre complet al resultat
        resultat.push(centreComplet);
      }
      
      // 10. Retornem el resultat
      return resultat;

    } catch (error) {
      console.error("Error a Centre.getAll:", error);
      throw error; 
    }
  },

  // A) --- Buscar un centre per ID incloent tallers, professors i responsables ---
  findById: async (id) => {
    try {
      // 1. Obtenim les dades bàsiques del centre
      const result = await db.query("SELECT * FROM centres WHERE id = ?", [id]);
      const rows = result[0];
      
      // 2. Comprovem si existeix el centre
      if (rows.length === 0) {
        return null;
      }
      
      // 3. Obtenim els tallers assignats al centre
      const resultTallers = await db.query(`
        SELECT t.titol, pd.estat 
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE p.centre_id = ? AND pd.estat = 'ASSIGNADA'
      `, [id]);
      const tallers = resultTallers[0];

      // 4. Obtenim els professors vinculats al centre
      const resultProfessors = await db.query(`
        SELECT id, nom, cognoms 
        FROM professors 
        WHERE centre_id = ?
      `, [id]);
      const professors = resultProfessors[0];

      // 5. Obtenim els responsables de grup i recompte d'alumnes
      const resultResponsables = await db.query(`
        SELECT DISTINCT pd.docent_nom as nom, pd.num_participants as n_alumnes, t.titol as taller
        FROM peticio_detalls pd
        JOIN peticions p ON pd.peticio_id = p.id
        JOIN tallers t ON pd.taller_id = t.id
        WHERE p.centre_id = ? AND pd.docent_nom IS NOT NULL
      `, [id]);
      const responsables_grups = resultResponsables[0];

      // 6. Creem l'objecte complet per al frontend
      const centreComplet = {};
      const centreBase = rows[0];
      
      // 7. Copiem totes les propietats del centre base
      for (const clau in centreBase) {
        centreComplet[clau] = centreBase[clau];
      }
      
      // 8. Afegim les propietats addicionals
      centreComplet.tallers = tallers;
      centreComplet.professors = professors;
      centreComplet.responsables_grups = responsables_grups;
      
      // 9. Retornem l'objecte complet
      return centreComplet;

    } catch (error) {
      console.error("Error a Centre.findById:", error);
      throw error;
    }
  },

  // A) --- Crear un nou centre ---
  create: async (data) => {
    // 1. Obtenim les dades del centre
    let codi_centre = data.codi_centre;
    
    // 2. Generem codi temporal si no n'hi ha
    if (!codi_centre) {
      codi_centre = "TEMP-" + Date.now();
    }
    
    // 3. Assignem la resta de variables, gestionant els nuls
    const nom_centre = data.nom_centre;
    
    let adreca = data.adreca;
    if (!adreca) adreca = null;
    
    let municipi = data.municipi;
    if (!municipi) municipi = null;
    
    let telefon = data.telefon;
    if (!telefon) telefon = null;
    
    let email_oficial = data.email_oficial;
    if (!email_oficial) email_oficial = null;
    
    let nom_coordinador = data.nom_coordinador;
    if (!nom_coordinador) nom_coordinador = null;
    
    let es_primera_vegada = data.es_primera_vegada;
    if (!es_primera_vegada) es_primera_vegada = 0;
    
    let user_id = data.user_id;
    if (!user_id) user_id = null;
    
    // 4. Executem la consulta SQL per inserir el centre
    const sql = `
      INSERT INTO centres 
      (codi_centre, nom_centre, adreca, municipi, telefon, email_oficial, nom_coordinador, es_primera_vegada, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      codi_centre, nom_centre, adreca, municipi,
      telefon, email_oficial, nom_coordinador,
      es_primera_vegada, user_id
    ]);
    
    // 5. Obtenim l'ID del registre inserit
    const rows = result[0];
    const insertId = rows.insertId;
    
    // 6. Retornem l'ID del nou centre
    return insertId;
  },

  // A) --- Actualitzar un centre existent ---
  update: async (id, data) => {
    // 1. Obtenim les dades del centre
    const codi_centre = data.codi_centre;
    const nom_centre = data.nom_centre;
    const adreca = data.adreca;
    const municipi = data.municipi;
    const telefon = data.telefon;
    const email_oficial = data.email_oficial;
    const nom_coordinador = data.nom_coordinador;
    const es_primera_vegada = data.es_primera_vegada;
    const user_id = data.user_id;
    
    // 2. Executem la consulta SQL per actualitzar el centre
    const sql = `
      UPDATE centres SET 
      codi_centre = ?, nom_centre = ?, adreca = ?, municipi = ?,
      telefon = ?, email_oficial = ?, nom_coordinador = ?,
      es_primera_vegada = ?, user_id = ?
      WHERE id = ?
    `;
    const result = await db.query(sql, [
      codi_centre, nom_centre, adreca, municipi,
      telefon, email_oficial, nom_coordinador,
      es_primera_vegada, user_id, id
    ]);
    
    // 3. Comprovem si s'ha actualitzat alguna fila
    const rows = result[0];
    const affectedRows = rows.affectedRows;
    
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Eliminar un centre ---
  delete: async (id) => {
    // 1. Executem la consulta SQL per eliminar el centre
    const result = await db.query("DELETE FROM centres WHERE id = ?", [id]);
    
    // 2. Comprovem si s'ha eliminat alguna fila
    const rows = result[0];
    const affectedRows = rows.affectedRows;
    
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Buscar un centre per ID d'usuari ---
  findByUserId: async (user_id) => {
    // 1. Executem la consulta SQL per buscar el centre
    const result = await db.query("SELECT * FROM centres WHERE user_id = ?", [user_id]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  }
};

module.exports = Centre;
