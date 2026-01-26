// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model AssignacioTaller: Gestiona la lògica d'assignació de tallers (usa peticio_detalls amb estat ASSIGNADA)

// ======================================
// Declaracions de funcions
// ======================================

const AssignacioTaller = {
  // A) --- Obtenir l'ocupació d'un taller en un trimestre concret ---
  getOcupacioTallerTrimestre: async (taller_id, trimestre) => {
    // 1. Executem la consulta SQL per obtenir l'ocupació
    const result = await db.query(`
      SELECT SUM(pd.num_participants) as total_ocupat
      FROM peticio_detalls pd
      WHERE pd.taller_id = ? AND pd.trimestre = ? AND pd.estat = 'ASSIGNADA'
    `, [taller_id, trimestre]);
    
    // 2. Obtenim els resultats de la consulta
    const rows = result[0];
    
    // 3. Obtenim el total ocupat
    const fila = rows[0];
    let total_ocupat = fila.total_ocupat;
    
    // 4. Si és null, el posem a 0
    if (total_ocupat === null) {
      total_ocupat = 0;
    }
    
    if (total_ocupat === undefined) {
      total_ocupat = 0;
    }

    // 5. Retornem el total ocupat
    return total_ocupat;
  },

  // A) --- Comprovar si hi ha capacitat suficient al taller ---
  teCapacitatSuficient: async (taller_id, trimestre, num_nous_participants) => {
    // 1. Obtenim les dades del taller
    const resultTaller = await db.query("SELECT id, places_maximes FROM tallers WHERE id = ?", [taller_id]);
    const rowsTaller = resultTaller[0];

    // 2. Comprovem si el taller existeix
    if (rowsTaller.length === 0) {
      const respostaError = {};
      respostaError.valid = false;
      respostaError.message = "Taller no trobat";
      return respostaError;
    }

    const taller = rowsTaller[0];

    // 3. Obtenim l'ocupació actual
    const ocupat = await AssignacioTaller.getOcupacioTallerTrimestre(taller_id, trimestre);

    // 4. Calculem les places lliures
    const places_maximes = taller.places_maximes;
    const lliures = places_maximes - ocupat;

    // 5. Comprovem si hi ha capacitat suficient
    let valid = false;
    if (num_nous_participants <= lliures) {
      valid = true;
    }

    // 6. Construïm l'objecte de resposta
    const resposta = {};
    resposta.valid = valid;
    resposta.lliures = lliures;
    resposta.ocupat = ocupat;
    resposta.maxim = places_maximes;

    // 7. Retornem la resposta
    return resposta;
  },

  // A) --- Obtenir les places lliures totals d'un taller en un trimestre ---
  getPlacesLliuresTotals: async (taller_id, trimestre) => {
    // 1. Obtenim les dades del taller
    const resultTaller = await db.query("SELECT places_maximes FROM tallers WHERE id = ?", [taller_id]);
    const rowsTaller = resultTaller[0];

    // 2. Comprovem si el taller existeix
    if (rowsTaller.length === 0) {
      return 0;
    }

    const taller = rowsTaller[0];

    // 3. Obtenim l'ocupació actual
    const ocupat = await AssignacioTaller.getOcupacioTallerTrimestre(taller_id, trimestre);

    // 4. Calculem les places lliures
    const places_maximes = taller.places_maximes;
    const lliures = places_maximes - ocupat;

    // 5. Retornem les places lliures
    return lliures;
  },

  // A) --- Comptar quants professors referents té una assignació ---
  getReferentsCount: async (peticio_detall_id) => {
    // 1. Executem la consulta SQL per comptar els referents
    const result = await db.query(
      "SELECT COUNT(*) as count FROM referents_assignats WHERE peticio_detall_id = ?",
      [peticio_detall_id]
    );
    const rows = result[0];
    
    // 2. Obtenim el compte
    const fila = rows[0];
    const count = fila.count;

    // 3. Retornem el compte
    return count;
  },

  // A) --- Obtenir totes les assignacions confirmades d'un centre ---
  getByCentreId: async (centre_id) => {
    // 1. Executem la consulta SQL per obtenir les assignacions
    const result = await db.query(`
      SELECT pd.id, pd.num_participants, pd.docent_nom, pd.docent_email, pd.estat,
             pd.trimestre, pd.descripcio, p.data_creacio, t.titol, t.modalitat, t.ubicacio, t.data_execucio
      FROM peticio_detalls pd
      JOIN peticions p ON pd.peticio_id = p.id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ? AND pd.estat = 'ASSIGNADA'
      ORDER BY p.data_creacio DESC
    `, [centre_id]);
    
    // 2. Obtenim les files del resultat
    const rows = result[0];

    // 3. Retornem els resultats
    return rows;
  },

  // B) --- Obtenir el detall d'una assignació per ID ---
  getById: async (id) => {
    // 1. Busquem les dades de l'assignació
    const result = await db.query(`
      SELECT pd.id, pd.num_participants, pd.docent_nom, pd.docent_email, pd.estat,
             pd.trimestre, pd.descripcio, p.data_creacio, t.titol, t.modalitat, t.ubicacio, t.data_execucio,
             p.centre_id
      FROM peticio_detalls pd
      JOIN peticions p ON pd.peticio_id = p.id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE pd.id = ?
    `, [id]);
    
    const rows = result[0];

    // 2. Comprovem si s'ha trobat l'assignació
    if (rows.length > 0) {
      const assignacio = rows[0];

      // 3. Busquem les sessions programades per a aquesta assignació
      const resultSessions = await db.query(`
        SELECT id, ordre, data
        FROM sessions
        WHERE peticio_detall_id = ?
        ORDER BY ordre ASC
      `, [id]);
      
      const sessions = resultSessions[0];

      // 4. Assignem les sessions a l'objecte assignació (o un array buit si no n'hi ha)
      if (sessions) {
        assignacio.sessions = sessions;
      } else {
        assignacio.sessions = [];
      }
      
      return assignacio;
    }
    
    // 5. Retornem null si no s'ha trobat
    return null;
  },

  // C) --- Comprovar si un professor és referent d'una assignació ---
  isReferent: async (peticio_detall_id, professor_id) => {
    // 1. Executem la consulta SQL complexa
    const result = await db.query(`
      SELECT 1
      FROM peticio_detalls pd_target
      JOIN peticio_detalls pd_ref ON pd_target.taller_id = pd_ref.taller_id
      JOIN professors p ON p.id = ?
      JOIN usuaris u ON p.user_id = u.id
      LEFT JOIN referents_assignats ra ON ra.peticio_detall_id = pd_ref.id
      WHERE pd_target.id = ?
      AND (ra.professor_id = ? OR (pd_ref.docent_email = u.email AND pd_ref.es_preferencia_referent = 1))
    `, [professor_id, peticio_detall_id, professor_id]);
    
    // 2. Obtenim les files
    const rows = result[0];
    
    // 3. Retornem cert si hi ha resultats, fals si no
    if (rows.length > 0) {
      return true;
    } else {
      return false;
    }
  }
};

module.exports = AssignacioTaller;