// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Config: Gestiona la taula 'configuracio'

// ======================================
// Declaracions de funcions
// ======================================

const Config = {
  // A) --- Obtenir una configuració per clau ---
  get: async (clau) => {
    // 1. Executem la consulta
    const result = await db.query("SELECT * FROM configuracio WHERE clau = ?", [clau]);
    
    // 2. Retornem la primera fila
    const rows = result[0];
    return rows[0];
  },

  // A) --- Actualitzar o crear una configuració ---
  set: async (clau, valor) => {
    // 1. Comprovem si existeix
    const existing = await Config.get(clau);
    
    // 2. Si existeix actualitzem, si no creem
    if (existing) {
      const result = await db.query("UPDATE configuracio SET valor = ? WHERE clau = ?", [valor, clau]);
      const rows = result[0];
      if (rows.affectedRows > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      const result = await db.query("INSERT INTO configuracio (clau, valor) VALUES (?, ?)", [clau, valor]);
      const rows = result[0];
      return rows.insertId;
    }
  },

  // A) --- Obtenir totes les configuracions ---
  getAll: async () => {
    // 1. Executem la consulta
    const result = await db.query("SELECT * FROM configuracio");
    
    // 2. Retornem les files
    const rows = result[0];
    return rows;
  }
};

module.exports = Config;
