// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Taller: Gestiona les operacions relacionades amb la taula 'tallers'

// ======================================
// Declaracions de funcions
// ======================================

const Taller = {
  // A) --- Obtenir tots els tallers (actius o arxivats) ---
  getAll: async (filter) => {
    // 1. Definim el valor per defecte del filtre
    let filtre = filter;
    if (!filtre) {
      filtre = 'active';
    }
    
    // 2. Construïm la consulta SQL base
    let sql = "SELECT * FROM tallers";
    const params = [];

    // 3. Afegim la condició segons el filtre
    if (filtre === 'active') {
      sql = sql + " WHERE actiu = 1";
    } else {
      if (filtre === 'archived') {
        sql = sql + " WHERE actiu = 0";
      }
    }
    
    // 4. Executem la consulta
    const result = await db.query(sql, params);
    const rows = result[0];
    
    // 5. Retornem els resultats
    return rows;
  },

  // A) --- Obtenir estadístiques esteses dels tallers ---
  getExtendedStats: async () => {
    // 1. Obtenim els tallers més sol·licitats (Top 5)
    const resultMesSolicitats = await db.query(`
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
    const mesSolicitats = resultMesSolicitats[0];

    // 2. Obtenim el sector del taller més realitzat
    const resultSectorTop = await db.query(`
      SELECT t.sector, COUNT(pd.id) as total
      FROM tallers t
      INNER JOIN peticio_detalls pd ON t.id = pd.taller_id
      WHERE pd.estat = 'ASSIGNADA'
      GROUP BY t.sector 
      ORDER BY total DESC LIMIT 1
    `);
    const sectorTop = resultSectorTop[0];

    // 3. Obtenim la modalitat més realitzada
    const resultModalitatTop = await db.query(`
      SELECT t.modalitat, COUNT(pd.id) as total
      FROM tallers t
      INNER JOIN peticio_detalls pd ON t.id = pd.taller_id
      WHERE pd.estat = 'ASSIGNADA'
      GROUP BY t.modalitat 
      ORDER BY total DESC LIMIT 1
    `);
    const modalitatTop = resultModalitatTop[0];

    // 4. Construïm l'objecte de retorn
    const resultat = {};
    
    // 5. Afegim els tallers més sol·licitats
    if (mesSolicitats) {
      resultat.mesSolicitats = mesSolicitats;
    } else {
      resultat.mesSolicitats = [];
    }
    
    // 6. Afegim el sector top
    if (sectorTop && sectorTop.length > 0) {
      resultat.sectorTop = sectorTop[0].sector;
    } else {
      resultat.sectorTop = 'Sense dades confirmades';
    }
    
    // 7. Afegim la modalitat top
    if (modalitatTop && modalitatTop.length > 0) {
      resultat.modalitatTop = modalitatTop[0].modalitat;
    } else {
      resultat.modalitatTop = 'N/A';
    }
    
    // 8. Retornem el resultat
    return resultat;
  },

  // A) --- Crear un nou taller ---
  create: async (data) => {
    // 1. Obtenim les dades del taller
    const titol = data.titol;
    let descripcio = data.descripcio;
    if (!descripcio) {
      descripcio = null;
    }
    const sector = data.sector;
    const modalitat = data.modalitat;
    let trimestres_disponibles = data.trimestres_disponibles;
    if (!trimestres_disponibles) {
      trimestres_disponibles = null;
    }
    let places_maximes = data.places_maximes;
    if (!places_maximes) {
      places_maximes = 12;
    }
    let adreca = data.adreca;
    if (!adreca) {
      adreca = null;
    }
    let ubicacio = data.ubicacio;
    if (!ubicacio) {
      ubicacio = null;
    }
    let data_execucio = data.data_execucio;
    if (!data_execucio) {
      data_execucio = null;
    }
    
    // 2. Executem la consulta SQL per inserir el taller
    const sql = `
      INSERT INTO tallers 
      (titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, places_restants, adreca, ubicacio, data_execucio, actiu) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const result = await db.query(sql, [
      titol, descripcio, sector, modalitat, trimestres_disponibles,
      places_maximes, places_maximes, adreca, ubicacio, data_execucio
    ]);
    
    // 3. Obtenim l'ID del registre inserit
    const insertId = result[0].insertId;
    
    // 4. Retornem l'ID del nou taller
    return insertId;
  },

  // A) --- Actualitzar un taller existent ---
  update: async (id, data) => {
    // 1. Obtenim les dades del taller
    const titol = data.titol;
    const descripcio = data.descripcio;
    const sector = data.sector;
    const modalitat = data.modalitat;
    const trimestres_disponibles = data.trimestres_disponibles;
    const places_maximes = data.places_maximes;
    const adreca = data.adreca;
    const ubicacio = data.ubicacio;
    const data_execucio = data.data_execucio;
    const actiu = data.actiu;
    
    // 2. Executem la consulta SQL per actualitzar el taller
    const sql = `
      UPDATE tallers SET titol = ?, descripcio = ?, sector = ?, modalitat = ?, 
      trimestres_disponibles = ?, places_maximes = ?, adreca = ?, ubicacio = ?, data_execucio = ?,
      actiu = COALESCE(?, actiu) WHERE id = ?
    `;
    const result = await db.query(sql, [titol, descripcio, sector, modalitat, trimestres_disponibles, places_maximes, adreca, ubicacio, data_execucio, actiu, id]);
    
    // 3. Comprovem si s'ha actualitzat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Restar places disponibles d'un taller ---
  restarPlaces: async (id, quantitat) => {
    // 1. Executem la consulta SQL per restar places
    const sql = "UPDATE tallers SET places_restants = places_restants - ? WHERE id = ?";
    const result = await db.query(sql, [quantitat, id]);
    
    // 2. Comprovem si s'ha actualitzat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Sumar places disponibles d'un taller ---
  sumarPlaces: async (id, quantitat) => {
    // 1. Executem la consulta SQL per sumar places
    const sql = "UPDATE tallers SET places_restants = places_restants + ? WHERE id = ?";
    const result = await db.query(sql, [quantitat, id]);
    
    // 2. Comprovem si s'ha actualitzat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Arxivar un taller ---
  archive: async (id) => {
    // 1. Executem la consulta SQL per arxivar el taller
    const result = await db.query("UPDATE tallers SET actiu = 0 WHERE id = ?", [id]);
    
    // 2. Comprovem si s'ha actualitzat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Eliminar un taller ---
  delete: async (id) => {
    // 1. Executem la consulta SQL per eliminar el taller
    const result = await db.query("DELETE FROM tallers WHERE id = ?", [id]);
    
    // 2. Comprovem si s'ha eliminat alguna fila
    const affectedRows = result[0].affectedRows;
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Buscar un taller per ID ---
  findById: async (id) => {
    // 1. Executem la consulta SQL per buscar el taller
    const result = await db.query("SELECT * FROM tallers WHERE id = ?", [id]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Comprovar si el taller té peticions associades ---
  hasDependencies: async (id) => {
    // 1. Executem la consulta SQL per comptar les peticions
    const result = await db.query("SELECT COUNT(*) as c FROM peticio_detalls WHERE taller_id = ?", [id]);
    const peticions = result[0];
    
    // 2. Comprovem si hi ha peticions
    const count = peticions[0].c;
    if (count > 0) {
      return true;
    } else {
      return false;
    }
  }
};

module.exports = Taller;
