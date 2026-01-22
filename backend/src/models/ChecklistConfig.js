// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model ChecklistConfig: Gestiona les operacions relacionades amb la taula 'checklist_config'

// ======================================
// Declaracions de funcions
// ======================================

const ChecklistConfig = {
  // A) --- Obtenir tots els passos del checklist ---
  getAll: async () => {
    // 1. Executem la consulta SQL per obtenir tots els passos
    const result = await db.query("SELECT * FROM checklist_config");
    const rows = result[0];
    
    // 2. Retornem els resultats
    return rows;
  },

  // A) --- Crear un nou pas del checklist ---
  create: async (data) => {
    // 1. Obtenim les dades del pas
    const titol_pas = data.titol_pas;
    let obligatori = data.obligatori;
    if (!obligatori) {
      obligatori = 1;
    }
    
    // 2. Executem la consulta SQL per inserir el pas
    const sql = `
      INSERT INTO checklist_config 
      (titol_pas, obligatori) 
      VALUES (?, ?)
    `;
    const result = await db.query(sql, [
      titol_pas, 
      obligatori
    ]);
    const resultat = result[0];
    
    // 3. Retornem l'ID del pas creat
    return resultat.insertId;
  },

  // A) --- Actualitzar un pas del checklist ---
  update: async (id, data) => {
    // 1. Obtenim les dades del pas
    const titol_pas = data.titol_pas;
    const obligatori = data.obligatori;
    
    // 2. Executem la consulta SQL per actualitzar el pas
    const sql = `
      UPDATE checklist_config SET 
      titol_pas = ?, 
      obligatori = ?
      WHERE id = ?
    `;
    const result = await db.query(sql, [
      titol_pas, 
      obligatori, 
      id
    ]);
    const resultat = result[0];
    
    // 3. Comprovem si s'ha actualitzat alguna fila
    if (resultat.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Eliminar un pas del checklist ---
  delete: async (id) => {
    // 1. Executem la consulta SQL per eliminar el pas
    const result = await db.query("DELETE FROM checklist_config WHERE id = ?", [id]);
    const resultat = result[0];
    
    // 2. Comprovem si s'ha eliminat alguna fila
    if (resultat.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Buscar un pas del checklist per ID ---
  findById: async (id) => {
    // 1. Executem la consulta SQL per buscar el pas
    const result = await db.query("SELECT * FROM checklist_config WHERE id = ?", [id]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Comprovar si un pas té respostes associades ---
  hasResponses: async (id) => {
    // 1. Executem la consulta SQL per comptar les respostes
    const result = await db.query("SELECT COUNT(*) as total FROM checklist_respostes WHERE checklist_config_id = ?", [id]);
    const rows = result[0];
    
    // 2. Obtenim el total
    const total = rows[0].total;
    
    // 3. Comprovem si hi ha respostes
    if (total > 0) {
      return true;
    } else {
      return false;
    }
  }
};

module.exports = ChecklistConfig;
