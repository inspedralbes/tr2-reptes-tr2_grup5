const db = require("../config/db");

const Matching = {
    // Obtenir totes les peticions pendents ordenades per prioritat i data
    getGlobalQueue: async () => {
        const sql = `
            SELECT 
                pd.id as detall_id,
                pd.peticio_id,
                pd.taller_id,
                pd.trimestre,
                pd.num_participants,
                pd.prioritat,
                pd.es_preferencia_referent,
                pd.docent_email,
                pd.estat,
                p.centre_id,
                p.data_creacio,
                t.modalitat,
                t.places_maximes
            FROM peticio_detalls pd
            JOIN peticions p ON pd.peticio_id = p.id
            JOIN tallers t ON pd.taller_id = t.id
            WHERE pd.estat = 'PENDENT'
            ORDER BY pd.prioritat ASC, p.data_creacio ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Obtenir el nombre de places ocupades d'un taller en un trimestre
    getOccupiedSpots: async (taller_id, trimestre) => {
        const sql = `
            SELECT COALESCE(SUM(pd.num_participants), 0) as ocupat
            FROM peticio_detalls pd
            WHERE pd.taller_id = ? 
              AND pd.trimestre = ? 
              AND pd.estat = 'ASSIGNADA'
        `;
        const [result] = await db.query(sql, [taller_id, trimestre]);
        return result[0].ocupat || 0;
    },

    // Obtenir el total d'alumnes assignats en modalitat C per un centre en un trimestre
    getCentreCountModC: async (centre_id, trimestre) => {
        const sql = `
            SELECT COALESCE(SUM(pd.num_participants), 0) as total_alumnes
            FROM peticio_detalls pd
            JOIN peticions p ON pd.peticio_id = p.id
            JOIN tallers t ON pd.taller_id = t.id
            WHERE p.centre_id = ?
              AND pd.trimestre = ?
              AND t.modalitat = 'C'
              AND pd.estat = 'ASSIGNADA'
        `;
        const [result] = await db.query(sql, [centre_id, trimestre]);
        return result[0].total_alumnes || 0;
    }
};

module.exports = Matching;
