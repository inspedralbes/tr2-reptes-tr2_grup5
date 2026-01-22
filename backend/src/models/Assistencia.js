const db = require("../config/db");

const Assistencia = {
    // Guardar llista d'assistència (pot ser un insert múltiple o un bucle transaction)
    saveList: async (peticio_detall_id, alumnes) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Opcional: Esborrar assistència prèvia si es vol sobreescriure, 
            // o fer INSERT ON DUPLICATE KEY UPDATE si es gestiona per email/id.
            // Per simplificar, assumim que es crea de nou o s'afegeixen. 
            // Si volem "editar", millor esborrar els existents d'aquesta petició i tornar a crear? 
            // Més segur fer INSERT individual.

            // En aquest cas, farem un simple INSERT per cada alumne.
            for (const alumne of alumnes) {
                await connection.query(`
                    INSERT INTO assistencia_alumnes (peticio_detall_id, nom, cognoms, email, ha_assistit)
                    VALUES (?, ?, ?, ?, ?)
                `, [peticio_detall_id, alumne.nom, alumne.cognoms, alumne.email, alumne.ha_assistit ? 1 : 0]);
            }

            await connection.commit();
            return { success: true, count: alumnes.length };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Obtenir llista d'assistència per a una petició
    getByDetallId: async (peticio_detall_id) => {
        const [rows] = await db.query(`
            SELECT * FROM assistencia_alumnes 
            WHERE peticio_detall_id = ?
            ORDER BY cognoms, nom
        `, [peticio_detall_id]);
        return rows;
    },

    // Actualitzar estat d'assistència d'un alumne
    updateStatus: async (id, ha_assistit) => {
        const [result] = await db.query(`
            UPDATE assistencia_alumnes
            SET ha_assistit = ?
            WHERE id = ?
        `, [ha_assistit ? 1 : 0, id]);
        return result.affectedRows > 0;
    }
};

module.exports = Assistencia;
