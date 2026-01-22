// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Peticio: Gestiona les operacions relacionades amb les taules 'peticions' i 'peticio_detalls'

// ======================================
// Declaracions de funcions
// ======================================

const Peticio = {
  // A) --- Obtenir el rànquing de centres basat en activitat ---
  getCentresPrioritatRanking: async () => {
    // 1. Executem la consulta SQL per obtenir el rànquing
    const sql = `
      SELECT 
        c.nom_centre,
        COUNT(pd.id) as total_tallers,
        SUM(pd.num_participants) as total_alumnes
      FROM centres c
      JOIN peticions p ON c.id = p.centre_id
      JOIN peticio_detalls pd ON p.id = pd.peticio_id
      WHERE pd.estat = 'ASSIGNADA'
      GROUP BY c.id
      ORDER BY total_tallers DESC, total_alumnes ASC
      LIMIT 5
    `;
    const result = await db.query(sql);
    const rows = result[0];
    
    // 2. Retornem els resultats
    return rows;
  },

  // A) --- Obtenir mètriques globals de centres i alumnes ---
  getCentresStats: async () => {
    // 1. Executem la consulta SQL per obtenir les estadístiques
    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT p.centre_id) as total_centres,
        SUM(pd.num_participants) as total_alumnes,
        AVG(pd.num_participants) as media_alumnes
      FROM peticions p
      JOIN peticio_detalls pd ON p.id = pd.peticio_id
    `);
    const rows = result[0];

    // 2. Executem la consulta SQL per obtenir el trimestre top
    const resultTrimTop = await db.query(`
      SELECT trimestre, COUNT(*) as total 
      FROM peticio_detalls 
      GROUP BY trimestre 
      ORDER BY total DESC LIMIT 1
    `);
    const trimTop = resultTrimTop[0];

    // 3. Construïm l'objecte de retorn
    const resultat = {};
    
    // 4. Copiem les propietats de la primera fila
    if (rows.length > 0) {
      const primeraFila = rows[0];
      for (const clau in primeraFila) {
        resultat[clau] = primeraFila[clau];
      }
    }
    
    // 5. Afegim el trimestre top
    if (trimTop && trimTop.length > 0) {
      resultat.trimestreTop = trimTop[0].trimestre;
    } else {
      resultat.trimestreTop = 'N/A';
    }

    // 6. Retornem el resultat
    return resultat;
  },

  // A) --- Crear una nova petició amb els seus detalls ---
  create: async (infoPeticio, tallersDetalls) => {
    // 1. Obtenim una connexió de la base de dades
    const connection = await db.getConnection();
    
    try {
      // 2. Iniciem una transacció
      await connection.beginTransaction();

      // 3. Inserim la petició principal
      const resultPeticio = await connection.query(
        "INSERT INTO peticions (centre_id) VALUES (?)",
        [infoPeticio.centre_id]
      );
      const peticioResult = resultPeticio[0];
      const peticio_id = peticioResult.insertId;

      // 4. Comprovem si hi ha detalls de tallers per inserir
      if (tallersDetalls && tallersDetalls.length > 0) {
        // 5. Creem l'array de valors per a la inserció múltiple
        const values = [];
        
        // 6. Recorrem cada detall de taller
        for (let i = 0; i < tallersDetalls.length; i++) {
          const detall = tallersDetalls[i];
          
          // 7. Calculem el nombre de participants (màxim 4)
          let num_participants = detall.num_participants;
          if (num_participants > 4) {
            num_participants = 4;
          }
          
          // 8. Obtenim la prioritat o utilitzem 1 per defecte
          let prioritat = detall.prioritat;
          if (!prioritat) {
            prioritat = 1;
          }
          
          // 9. Convertim es_preferencia_referent a 1 o 0
          let es_preferencia_referent = 0;
          if (detall.es_preferencia_referent) {
            es_preferencia_referent = 1;
          }
          
          // 10. Obtenim les dades opcionals
          let docent_nom = detall.docent_nom;
          if (!docent_nom) {
            docent_nom = null;
          }
          let docent_email = detall.docent_email;
          if (!docent_email) {
            docent_email = null;
          }
          let descripcio = detall.descripcio;
          if (!descripcio) {
            descripcio = null;
          }
          
          // 11. Creem l'array de valors per a aquest detall
          const valorsDetall = [
            peticio_id,
            detall.taller_id,
            detall.trimestre,
            num_participants,
            prioritat,
            es_preferencia_referent,
            docent_nom,
            docent_email,
            descripcio
          ];
          
          // 12. Afegim els valors a l'array principal
          values.push(valorsDetall);
        }
        
        // 13. Executem la inserció múltiple
        const detallsSql = "INSERT INTO peticio_detalls (peticio_id, taller_id, trimestre, num_participants, prioritat, es_preferencia_referent, docent_nom, docent_email, descripcio) VALUES ?";
        await connection.query(detallsSql, [values]);
      }

      // 14. Confirmem la transacció
      await connection.commit();
      
      // 15. Retornem l'ID de la petició creada
      return peticio_id;
    } catch (error) {
      // 16. En cas d'error, fem rollback
      await connection.rollback();
      throw error;
    } finally {
      // 17. Alliberem la connexió
      connection.release();
    }
  },

  // A) --- Obtenir totes les peticions d'un centre ---
  getByCentreId: async (centre_id) => {
    // 1. Executem la consulta SQL per obtenir les peticions
    const result = await db.query(`
      SELECT p.*, pd.id as detall_id, pd.taller_id, pd.trimestre, pd.num_participants, pd.prioritat, pd.es_preferencia_referent, pd.estat as detall_estat, pd.descripcio, t.titol as taller_titol
      FROM peticions p
      LEFT JOIN peticio_detalls pd ON p.id = pd.peticio_id
      LEFT JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ?
      ORDER BY p.data_creacio DESC
    `, [centre_id]);
    const rows = result[0];
    
    // 2. Retornem els resultats
    return rows;
  },

  // A) --- Obtenir totes les peticions amb filtres (per a administradors) ---
  getAllAdmin: async (filters) => {
    // 1. Definim el valor per defecte dels filtres
    let filtres = filters;
    if (!filtres) {
      filtres = {};
    }
    
    // 2. Construïm la consulta SQL base
    let sql = `
      SELECT DISTINCT p.*, c.nom_centre
      FROM peticions p
      JOIN centres c ON p.centre_id = c.id
      JOIN peticio_detalls pd ON p.id = pd.peticio_id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE 1=1
    `;
    const params = [];

    // 3. Afegim els filtres segons els paràmetres
    if (filtres.taller_id) {
      sql = sql + " AND pd.taller_id = ?";
      params.push(filtres.taller_id);
    }
    if (filtres.centre_id) {
      sql = sql + " AND p.centre_id = ?";
      params.push(filtres.centre_id);
    }
    if (filtres.modalitat) {
      sql = sql + " AND t.modalitat = ?";
      params.push(filtres.modalitat);
    }
    if (filtres.trimestre) {
      sql = sql + " AND pd.trimestre = ?";
      params.push(filtres.trimestre);
    }
    if (filtres.estat) {
      sql = sql + " AND pd.estat = ?";
      params.push(filtres.estat);
    }

    // 4. Afegim l'ordenació
    sql = sql + " ORDER BY p.data_creacio DESC";

    // 5. Executem la consulta
    const result = await db.query(sql, params);
    const rows = result[0];

    // 6. Enriquim cada petició amb els seus detalls
    const enrichedRows = [];
    
    // 7. Recorrem cada petició
    for (let i = 0; i < rows.length; i++) {
      const peticio = rows[i];
      
      // 8. Obtenim els detalls d'aquesta petició
      const resultDetalls = await db.query(`
        SELECT pd.*, t.titol, t.modalitat 
        FROM peticio_detalls pd
        JOIN tallers t ON pd.taller_id = t.id
        WHERE pd.peticio_id = ?
      `, [peticio.id]);
      const detalls = resultDetalls[0];
      
      // 9. Creem un objecte nou per a la petició enriquida
      const peticioEnriquida = {};
      
      // 10. Copiem totes les propietats de la petició
      for (const clau in peticio) {
        peticioEnriquida[clau] = peticio[clau];
      }
      
      // 11. Afegim els detalls
      peticioEnriquida.detalls = detalls;
      
      // 12. Afegim la petició enriquida al resultat
      enrichedRows.push(peticioEnriquida);
    }

    // 13. Retornem les peticions enriquides
    return enrichedRows;
  },

  // A) --- Buscar una petició per ID ---
  findById: async (id) => {
    // 1. Executem la consulta SQL per obtenir la petició
    const resultPeticio = await db.query(`
      SELECT p.*, c.nom_centre 
      FROM peticions p 
      JOIN centres c ON p.centre_id = c.id 
      WHERE p.id = ?
    `, [id]);
    const peticio = resultPeticio[0];

    // 2. Comprovem si existeix la petició
    if (!peticio || peticio.length === 0) {
      return null;
    }

    // 3. Obtenim els detalls de la petició
    const resultDetalls = await db.query(`
      SELECT pd.*, t.titol, t.modalitat 
      FROM peticio_detalls pd 
      JOIN tallers t ON pd.taller_id = t.id 
      WHERE pd.peticio_id = ?
    `, [id]);
    const detalls = resultDetalls[0];

    // 4. Creem l'objecte complet
    const peticioCompleta = {};
    const peticioBase = peticio[0];
    
    // 5. Copiem totes les propietats de la petició base
    for (const clau in peticioBase) {
      peticioCompleta[clau] = peticioBase[clau];
    }
    
    // 6. Afegim els detalls
    peticioCompleta.detalls = detalls;
    
    // 7. Retornem la petició completa
    return peticioCompleta;
  },

  // A) --- Eliminar una petició ---
  delete: async (id) => {
    // 1. Executem la consulta SQL per eliminar la petició
    const result = await db.query("DELETE FROM peticions WHERE id = ?", [id]);
    
    // 2. Comprovem si s'ha eliminat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Actualitzar l'estat d'un detall de petició ---
  updateEstat: async (peticio_id, taller_id, estat) => {
    // 1. Definim els estats vàlids
    const estatsValids = ['PENDENT', 'ASSIGNADA', 'REBUTJADA'];
    
    // 2. Comprovem si l'estat és vàlid
    let estatValid = false;
    for (let i = 0; i < estatsValids.length; i++) {
      if (estatsValids[i] === estat) {
        estatValid = true;
        break;
      }
    }
    
    // 3. Si l'estat no és vàlid, llancem un error
    if (!estatValid) {
      let missatge = "Estat no vàlid: " + estat + ". Ha de ser un de: ";
      for (let i = 0; i < estatsValids.length; i++) {
        missatge = missatge + estatsValids[i];
        if (i < estatsValids.length - 1) {
          missatge = missatge + ", ";
        }
      }
      throw new Error(missatge);
    }

    // 4. Executem la consulta SQL per actualitzar l'estat
    const result = await db.query(
      "UPDATE peticio_detalls SET estat = ? WHERE peticio_id = ? AND taller_id = ?",
      [estat, peticio_id, taller_id]
    );
    
    // 5. Comprovem si s'ha actualitzat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Rebutjar peticions per manca de places ---
  rebutjarPerMancaDePlaces: async (taller_id, trimestre, places_disponibles) => {
    // 1. Executem la consulta SQL per rebutjar les peticions
    const sql = `
      UPDATE peticio_detalls pd
      SET pd.estat = 'REBUTJADA'
      WHERE pd.taller_id = ? 
        AND pd.trimestre = ?
        AND pd.estat = 'PENDENT' 
        AND pd.num_participants > ?
    `;
    const result = await db.query(sql, [taller_id, trimestre, places_disponibles]);
    
    // 2. Retornem el nombre de files afectades
    return result[0].affectedRows;
  }
};

module.exports = Peticio;
