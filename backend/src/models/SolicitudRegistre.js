// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model SolicitudRegistre: Gestiona les operacions relacionades amb la taula 'solicituds_registre'

// ======================================
// Declaracions de funcions
// ======================================

const SolicitudRegistre = {
  // A) --- Obtenir totes les sol·licituds de registre ---
  getAll: async () => {
    // 1. Executem la consulta SQL per obtenir totes les sol·licituds
    const result = await db.query("SELECT * FROM solicituds_registre ORDER BY data_enviament DESC");
    const rows = result[0];
    
    // 2. Retornem els resultats
    return rows;
  },

  // A) --- Crear una nova sol·licitud de registre ---
  create: async (data) => {
    // 1. Obtenim les dades de la sol·licitud
    const codi_centre = data.codi_centre;
    const nom_centre = data.nom_centre;
    
    let nom_centre_manual = data.nom_centre_manual;
    if (!nom_centre_manual) {
      nom_centre_manual = null;
    }
    
    const password = data.password;
    const adreca = data.adreca;
    const municipi = data.municipi;
    const telefon = data.telefon;
    const email_centre = data.email_centre;
    const nom_coordinador = data.nom_coordinador;
    const email_coordinador = data.email_coordinador;
    
    let es_primera_vegada = 0;
    if (data.es_primera_vegada) {
      es_primera_vegada = 1;
    }

    // 2. Executem la consulta SQL per inserir la sol·licitud
    const sql = `
      INSERT INTO solicituds_registre 
      (codi_centre, nom_centre, nom_centre_manual, password, adreca, municipi, telefon, email_centre, nom_coordinador, email_coordinador, es_primera_vegada) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      codi_centre,
      nom_centre,
      nom_centre_manual,
      password,
      adreca,
      municipi,
      telefon,
      email_centre,
      nom_coordinador,
      email_coordinador,
      es_primera_vegada
    ]);
    const rows = result[0];

    // 3. Retornem l'ID de la sol·licitud creada
    return rows.insertId;
  },

  // A) --- Actualitzar una sol·licitud de registre ---
  update: async (id, data) => {
    // 1. Obtenim les dades de la sol·licitud
    const codi_centre = data.codi_centre;
    const nom_centre = data.nom_centre;
    
    let nom_centre_manual = data.nom_centre_manual;
    if (!nom_centre_manual) {
      nom_centre_manual = null;
    }
    
    const password = data.password;
    const adreca = data.adreca;
    const municipi = data.municipi;
    const telefon = data.telefon;
    const email_centre = data.email_centre;
    const nom_coordinador = data.nom_coordinador;
    const email_coordinador = data.email_coordinador;
    
    let es_primera_vegada = 0;
    if (data.es_primera_vegada) {
      es_primera_vegada = 1;
    }
    
    const estat = data.estat;

    // 2. Executem la consulta SQL per actualitzar la sol·licitud
    const sql = `
      UPDATE solicituds_registre SET 
      codi_centre = ?,
      nom_centre = ?,
      nom_centre_manual = ?,
      password = ?,
      adreca = ?,
      municipi = ?,
      telefon = ?,
      email_centre = ?,
      nom_coordinador = ?,
      email_coordinador = ?,
      es_primera_vegada = ?,
      estat = ?
      WHERE id = ?
    `;
    const result = await db.query(sql, [
      codi_centre,
      nom_centre,
      nom_centre_manual,
      password,
      adreca,
      municipi,
      telefon,
      email_centre,
      nom_coordinador,
      email_coordinador,
      es_primera_vegada,
      estat,
      id
    ]);
    const rows = result[0];

    // 3. Comprovem si s'ha actualitzat alguna fila
    if (rows.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Eliminar una sol·licitud de registre ---
  delete: async (id) => {
    // 1. Executem la consulta SQL per eliminar la sol·licitud
    const result = await db.query("DELETE FROM solicituds_registre WHERE id = ?", [id]);
    const rows = result[0];
    
    // 2. Comprovem si s'ha eliminat alguna fila
    if (rows.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Buscar una sol·licitud per ID ---
  findById: async (id) => {
    // 1. Executem la consulta SQL per buscar la sol·licitud
    const result = await db.query("SELECT * FROM solicituds_registre WHERE id = ?", [id]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Buscar una sol·licitud per email del coordinador ---
  findByEmailCoordinador: async (email) => {
    // 1. Executem la consulta SQL per buscar la sol·licitud
    const result = await db.query("SELECT * FROM solicituds_registre WHERE email_coordinador = ?", [email]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Buscar una sol·licitud per codi de centre ---
  findByCodiCentre: async (codi) => {
    // 1. Executem la consulta SQL per buscar la sol·licitud
    const result = await db.query("SELECT * FROM solicituds_registre WHERE codi_centre = ?", [codi]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Buscar una sol·licitud per email del centre ---
  findByEmailCentre: async (email) => {
    // 1. Executem la consulta SQL per buscar la sol·licitud
    const result = await db.query("SELECT * FROM solicituds_registre WHERE email_centre = ?", [email]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  }
};

module.exports = SolicitudRegistre;
