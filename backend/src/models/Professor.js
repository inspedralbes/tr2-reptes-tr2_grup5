const db = require("../config/db");

const Professor = {
    // Obtenir tots els professors d'un centre amb el seu email (de la taula usuaris)
    getByCentreId: async (centre_id) => {
        const [rows] = await db.query(`
            SELECT p.id, p.nom, p.cognoms, u.email 
            FROM professors p
            LEFT JOIN usuaris u ON p.user_id = u.id
            WHERE p.centre_id = ?
        `, [centre_id]);
        return rows;
    }
};

module.exports = Professor;
