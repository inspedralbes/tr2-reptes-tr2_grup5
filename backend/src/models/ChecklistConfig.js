const db = require("../config/db");

// Model de ChecklistConfig
// Encarna la lògica d'accés a dades per a la taula 'checklist_config'
const ChecklistConfig = {
  // Obtenir tots els passos del checklist
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM checklist_config");
    return rows;
  },

  // Crear un nou pas del checklist
  create: async (data) => {
    const { 
      titol_pas, 
      obligatori 
    } = data;
    
    const sql = `
      INSERT INTO checklist_config 
      (titol_pas, obligatori) 
      VALUES (?, ?)
    `;
    
    const [result] = await db.query(sql, [
      titol_pas, 
      obligatori || 1 // Per defecte és obligatori
    ]);
    
    return result.insertId;
  },

  // Actualitzar un pas del checklist
  update: async (id, data) => {
    const { 
      titol_pas, 
      obligatori 
    } = data;
    
    const sql = `
      UPDATE checklist_config SET 
      titol_pas = ?, 
      obligatori = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      titol_pas, 
      obligatori, 
      id
    ]);
    
    return result.affectedRows > 0;
  },

  // Eliminar un pas del checklist
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM checklist_config WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Buscar per ID
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM checklist_config WHERE id = ?", [id]);
    return rows[0];
  },

  // Comprovar si té respostes associades (Integritat referencial lògica)
  hasResponses: async (id) => {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM checklist_respostes WHERE checklist_config_id = ?", [id]);
    return rows[0].total > 0;
  }
};

module.exports = ChecklistConfig;
