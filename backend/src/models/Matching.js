// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Matching: Proporciona consultes per a l'algoritme d'assignació automàtica

// ======================================
// Declaracions de funcions
// ======================================

const Matching = {
  // A) --- Obtenir la cola global de peticions pendents ordenades per prioritat ---
  getGlobalQueue: async () => {
    // 1. Executem la consulta SQL per obtenir la cola de peticions
    const sql = `
      SELECT 
        pd.id as detall_id,
        pd.peticio_id,
        pd.taller_id,
        pd.trimestre,
        pd.num_participants,
        pd.prioritat,
        pd.es_preferencia_referent,
        pd.docent_email,
        pd.estat,
        p.centre_id,
        p.data_creacio,
        t.modalitat,
        t.places_maximes
      FROM peticio_detalls pd
      JOIN peticions p ON pd.peticio_id = p.id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE pd.estat = 'PENDENT'
      ORDER BY pd.prioritat ASC, p.data_creacio ASC
    `;
    const result = await db.query(sql);
    const rows = result[0];
    
    // 2. Retornem els resultats
    return rows;
  },

  // A) --- Obtenir el nombre de places ocupades d'un taller en un trimestre ---
  getOccupiedSpots: async (taller_id, trimestre) => {
    // 1. Executem la consulta SQL per obtenir les places ocupades
    const sql = `
      SELECT COALESCE(SUM(pd.num_participants), 0) as ocupat
      FROM peticio_detalls pd
      WHERE pd.taller_id = ? 
        AND pd.trimestre = ? 
        AND pd.estat = 'ASSIGNADA'
    `;
    const result = await db.query(sql, [taller_id, trimestre]);
    const resultat = result[0];
    
    // 2. Obtenim el valor ocupat
    let ocupat = resultat[0].ocupat;
    if (!ocupat) {
      ocupat = 0;
    }
    
    // 3. Retornem el valor ocupat
    return ocupat;
  },

  // A) --- Obtenir el total d'alumnes assignats en modalitat C per un centre en un trimestre ---
  getCentreCountModC: async (centre_id, trimestre) => {
    // 1. Executem la consulta SQL per obtenir el total d'alumnes
    const sql = `
      SELECT COALESCE(SUM(pd.num_participants), 0) as total_alumnes
      FROM peticio_detalls pd
      JOIN peticions p ON pd.peticio_id = p.id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ?
        AND pd.trimestre = ?
        AND t.modalitat = 'C'
        AND pd.estat = 'ASSIGNADA'
    `;
    const result = await db.query(sql, [centre_id, trimestre]);
    const resultat = result[0];
    
    // 2. Obtenim el total d'alumnes
    let total_alumnes = resultat[0].total_alumnes;
    if (!total_alumnes) {
      total_alumnes = 0;
    }
    
    // 3. Retornem el total d'alumnes
    return total_alumnes;
  }
};

module.exports = Matching;
