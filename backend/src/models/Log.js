const db = require("../config/db");

const Log = {
  create: async ({ usuari_id, accio, taula_afectada, valor_anterior, valor_nou }) => {
    try {
      const sql = `
        INSERT INTO logs_auditoria 
        (usuari_id, accio, taula_afectada, valor_anterior, valor_nou) 
        VALUES (?, ?, ?, ?, ?)
      `;
      // Convertir objectes a STRING per guardar-los com TEXT
      const prevString = valor_anterior ? JSON.stringify(valor_anterior) : null;
      const nouString = valor_nou ? JSON.stringify(valor_nou) : null;

      await db.query(sql, [
        usuari_id || null,
        accio,
        taula_afectada,
        prevString,
        nouString
      ]);
    } catch (error) {
      // El log no hauria de trencar l'execució principal, només ho mostrem per consola
      console.error("Error creant log d'auditoria:", error.message);
    }
  },

  getAll: async () => {
    try {
      const [rows] = await db.query(`
        SELECT l.*, u.email as usuari_email
        FROM logs_auditoria l
        LEFT JOIN usuaris u ON l.usuari_id = u.id
        ORDER BY l.data_registre DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error obtenint logs d'auditoria:", error.message);
      return [];
    }
  }
};

module.exports = Log;
