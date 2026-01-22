const db = require("../config/db");

const AssignacioTaller = {
    // Obtenir l'ocupació d'un taller en un trimestre concret
    getOcupacioTallerTrimestre: async (taller_id, trimestre) => {
        const [result] = await db.query(`
            SELECT SUM(pd.num_participants) as total_ocupat
            FROM peticio_detalls pd
            WHERE pd.taller_id = ? AND pd.trimestre = ? AND pd.estat = 'ASSIGNADA'
        `, [taller_id, trimestre]);

        return result[0].total_ocupat || 0;
    },

    // Comprovar si hi ha capacitat al taller per a un trimestre
    teCapacitatSuficient: async (taller_id, trimestre, num_nous_participants) => {
        const [taller] = await db.query("SELECT id, places_maximes FROM tallers WHERE id = ?", [taller_id]);
        if (!taller[0]) return { valid: false, message: "Taller no trobat" };

        const ocupat = await AssignacioTaller.getOcupacioTallerTrimestre(taller_id, trimestre);
        const lliures = taller[0].places_maximes - ocupat;
        const valid = num_nous_participants <= lliures;

        return {
            valid,
            lliures,
            ocupat,
            maxim: taller[0].places_maximes
        };
    },

    // Places lliures totals d'un taller en un trimestre
    getPlacesLliuresTotals: async (taller_id, trimestre) => {
        const [taller] = await db.query("SELECT places_maximes FROM tallers WHERE id = ?", [taller_id]);
        if (!taller[0]) return 0;

        const ocupat = await AssignacioTaller.getOcupacioTallerTrimestre(taller_id, trimestre);
        return taller[0].places_maximes - ocupat;
    },


    // Compta quants professors referents té una assignació
    getReferentsCount: async (peticio_detall_id) => {
        const [result] = await db.query(
            "SELECT COUNT(*) as count FROM referents_assignats WHERE peticio_detall_id = ?",
            [peticio_detall_id]
        );
        return result[0].count;
    },

    // Obtenir totes les assignacions (detalls acceptats) d'un centre
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
    }
};

module.exports = AssignacioTaller;
