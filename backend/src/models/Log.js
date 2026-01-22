// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Log: Gestiona les operacions relacionades amb la taula 'logs_auditoria'

// ======================================
// Declaracions de funcions
// ======================================

const Log = {
  // A) --- Crear un log d'auditoria ---
  create: async (dades) => {
    try {
      // 1. Obtenim les dades del log
      let usuari_id = dades.usuari_id;
      if (!usuari_id) {
        usuari_id = null;
      }
      const accio = dades.accio;
      const taula_afectada = dades.taula_afectada;
      const valor_anterior = dades.valor_anterior;
      const valor_nou = dades.valor_nou;
      
      // 2. Convertim els objectes a JSON string
      let prevString = null;
      if (valor_anterior) {
        prevString = JSON.stringify(valor_anterior);
      }
      
      let nouString = null;
      if (valor_nou) {
        nouString = JSON.stringify(valor_nou);
      }
      
      // 3. Executem la consulta SQL per inserir el log
      const sql = `
        INSERT INTO logs_auditoria 
        (usuari_id, accio, taula_afectada, valor_anterior, valor_nou) 
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.query(sql, [
        usuari_id, 
        accio, 
        taula_afectada, 
        prevString, 
        nouString
      ]);
    } catch (error) {
      // 4. En cas d'error, només ho registrem per consola (no trenquem l'execució principal)
      console.error("Error creant log d'auditoria:", error.message);
    }
  }
};

module.exports = Log;
