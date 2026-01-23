const db = require("../config/db");

const AssignacioTaller = {
    getOcupacioTallerTrimestre: async (taller_id, trimestre) => {
        const [result] = await db.query(`
            SELECT SUM(pd.num_participants) as total_ocupat
            FROM peticio_detalls pd
            WHERE pd.taller_id = ? AND pd.trimestre = ? AND pd.estat = 'ASSIGNADA'
        `, [taller_id, trimestre]);
        return result[0].total_ocupat || 0;
    },

    teCapacitatSuficient: async (taller_id, trimestre, num_nous_participants) => {
        const [taller] = await db.query("SELECT id, places_maximes FROM tallers WHERE id = ?", [taller_id]);
        if (!taller[0]) return { valid: false, message: "Taller no trobat" };

        const ocupat = await AssignacioTaller.getOcupacioTallerTrimestre(taller_id, trimestre);
        const lliures = taller[0].places_maximes - ocupat;
        const valid = num_nous_participants <= lliures;

        return { valid, lliures, ocupat, maxim: taller[0].places_maximes };
    },

    getPlacesLliuresTotals: async (taller_id, trimestre) => {
        const [taller] = await db.query("SELECT places_maximes FROM tallers WHERE id = ?", [taller_id]);
        if (!taller[0]) return 0;
        const ocupat = await AssignacioTaller.getOcupacioTallerTrimestre(taller_id, trimestre);
        return taller[0].places_maximes - ocupat;
    },

    getReferentsCount: async (peticio_detall_id) => {
        const [result] = await db.query(
            "SELECT COUNT(*) as count FROM referents_assignats WHERE peticio_detall_id = ?",
            [peticio_detall_id]
        );
        return result[0].count;
    },

    getByCentreId: async (centre_id) => {
        const [rows] = await db.query(`
            SELECT pd.id, pd.num_participants, pd.docent_nom, pd.docent_email, pd.estat,
                   pd.trimestre, pd.descripcio, p.data_creacio, t.titol, t.modalitat, t.ubicacio
            FROM peticio_detalls pd
            JOIN peticions p ON pd.peticio_id = p.id
            JOIN tallers t ON pd.taller_id = t.id
            WHERE p.centre_id = ? AND pd.estat = 'ASSIGNADA'
            ORDER BY p.data_creacio DESC
        `, [centre_id]);
        return rows;
    },

    // --- Mètode per obtenir el detall individual ---
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT pd.id, pd.num_participants, pd.docent_nom, pd.docent_email, pd.estat,
                   pd.trimestre, pd.descripcio, p.data_creacio, t.titol, t.modalitat, t.ubicacio,
                   p.centre_id
            FROM peticio_detalls pd
            JOIN peticions p ON pd.peticio_id = p.id
            JOIN tallers t ON pd.taller_id = t.id
            WHERE pd.id = ?
        `, [id]);
        return rows[0]; 
    },

    isReferent: async (peticio_detall_id, professor_id) => {
        const [rows] = await db.query(`
            SELECT 1 
            FROM peticio_detalls pd_target
            JOIN peticio_detalls pd_ref ON pd_target.taller_id = pd_ref.taller_id
            JOIN professors p ON p.id = ?
            JOIN usuaris u ON p.user_id = u.id
            LEFT JOIN referents_assignats ra ON ra.peticio_detall_id = pd_ref.id
            WHERE pd_target.id = ? 
            AND (ra.professor_id = ? OR (pd_ref.docent_email = u.email AND pd_ref.es_preferencia_referent = 1))
        `, [professor_id, peticio_detall_id, professor_id]);
        return rows.length > 0;
    }
};

module.exports = AssignacioTaller;