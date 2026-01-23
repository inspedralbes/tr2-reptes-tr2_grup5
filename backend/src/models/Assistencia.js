const db = require("../config/db");

const Assistencia = {
    // Guardar llista d'assistència
    saveList: async (peticio_detall_id, alumnes) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Sugerencia: Limpiar lista previa para evitar duplicados si se re-envía
            await connection.query('DELETE FROM assistencia_alumnes WHERE peticio_detall_id = ?', [peticio_detall_id]);

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
    },

    /**
     * NUEVOS MÉTODOS PARA EL DASHBOARD
     */

    // 1. Obtener ranking de centros basado en asistencia real vs planificada
    getRankingAsistenciaCentres: async () => {
        const [rows] = await db.query(`
            SELECT 
                c.nom_centre,
                COUNT(DISTINCT pd.id) as total_tallers,
                SUM(pd.num_participants) as total_alumnes_planificats,
                (
                    SELECT COUNT(*) 
                    FROM assistencia_alumnes aa 
                    JOIN peticio_detalls pd2 ON aa.peticio_detall_id = pd2.id
                    JOIN peticions p2 ON pd2.peticio_id = p2.id
                    WHERE p2.centre_id = c.id AND aa.ha_assistit = 1
                ) as alumnes_reals,
                ROUND(
                    IFNULL(
                        ((SELECT COUNT(*) 
                          FROM assistencia_alumnes aa 
                          JOIN peticio_detalls pd2 ON aa.peticio_detall_id = pd2.id
                          JOIN peticions p2 ON pd2.peticio_id = p2.id
                          WHERE p2.centre_id = c.id AND aa.ha_assistit = 1) 
                        / NULLIF(SUM(pd.num_participants), 0)) * 100, 
                    0), 
                2) as percentatge_asistencia
            FROM centres c
            JOIN peticions p ON c.id = p.centre_id
            JOIN peticio_detalls pd ON p.id = pd.peticio_id
            WHERE pd.estat = 'ASSIGNADA'
            GROUP BY c.id, c.nom_centre
            ORDER BY percentatge_asistencia DESC
        `);
        return rows;
    },

    // 2. Obtener estadísticas de tallers por ejecución
    getStatsTallers: async () => {
        const [rows] = await db.query(`
            SELECT 
                t.titol,
                t.sector,
                t.modalitat,
                COUNT(pd.id) as total_peticions,
                ROUND((COUNT(pd.id) / (SELECT COUNT(*) FROM peticio_detalls WHERE estat = 'ASSIGNADA')) * 100, 1) as percentatge_impacte
            FROM tallers t
            JOIN peticio_detalls pd ON t.id = pd.taller_id
            WHERE pd.estat = 'ASSIGNADA'
            GROUP BY t.id
            ORDER BY total_peticions DESC
            LIMIT 5
        `);
        return rows;
    },

    getTotalAlumnesRegistrats: async () => {
    const [rows] = await db.query(`
        SELECT COUNT(*) as total 
        FROM assistencia_alumnes
    `);
    return rows[0].total || 0;
}


    
};

module.exports = Assistencia;