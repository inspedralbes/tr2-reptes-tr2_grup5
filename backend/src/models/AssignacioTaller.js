const db = require("../config/db");

const AssignacioTaller = {
    // Buscar una assignació específica (el grup físic del taller)
    findById: async (id) => {
        const [rows] = await db.query(`
            SELECT a.*, t.titol, t.places_maximes 
            FROM assignacions_tallers a
            JOIN tallers t ON a.taller_id = t.id
            WHERE a.id = ?
        `, [id]);
        return rows[0];
    },

    // Calcular quantes places estan ja ocupades en un grup concret
    getOcupacioActual: async (assignacio_taller_id) => {
        const [result] = await db.query(`
            SELECT SUM(num_places_assignades) as total_ocupat
            FROM peticions_tallers_assignats
            WHERE assignacio_taller_id = ?
        `, [assignacio_taller_id]);

        return result[0].total_ocupat || 0;
    },

    // Vincular una petició (o part d'ella) a un grup de taller
    realitzarAssignacio: async (data, connection = null) => {
        const { peticio_id, taller_id, assignacio_taller_id, num_participants } = data;
        const executor = connection || db;

        const sql = `
            INSERT INTO peticions_tallers_assignats 
            (peticio_id, taller_id, assignacio_taller_id, num_places_assignades) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await executor.query(sql, [peticio_id, taller_id, assignacio_taller_id, num_participants]);
        return result.insertId;
    },

    // Llistar tots els grups de taller per a un taller concret
    getGrupsPerTaller: async (taller_id) => {
        const [rows] = await db.query("SELECT * FROM assignacions_tallers WHERE taller_id = ?", [taller_id]);
        return rows;
    },

    teCapacitatSuficient: async (assignacio_taller_id, num_nous_participants) => {
        const [grup] = await db.query(`
            SELECT a.id, t.places_maximes, 
                   (SELECT COALESCE(SUM(num_places_assignades), 0) 
                    FROM peticions_tallers_assignats 
                    WHERE assignacio_taller_id = a.id) as ocupat
            FROM assignacions_tallers a
            JOIN tallers t ON a.taller_id = t.id
            WHERE a.id = ?
        `, [assignacio_taller_id]);

        if (!grup) return { valid: false, message: "Grup no trobat" };

        const lliures = grup.places_maximes - grup.ocupat;
        const valid = num_nous_participants <= lliures;

        return {
            valid,
            lliures,
            ocupat: grup.ocupat,
            maxim: grup.places_maximes
        };
    },

    // Calcula les places lliures totals sumant tots els grups d'un taller
    getPlacesLliuresTotals: async (taller_id) => {
        const [result] = await db.query(`
            SELECT 
                (SELECT SUM(t.places_maximes) 
                 FROM assignacions_tallers a 
                 JOIN tallers t ON a.taller_id = t.id 
                 WHERE a.taller_id = ?) -
                (SELECT COALESCE(SUM(num_places_assignades), 0) 
                 FROM peticions_tallers_assignats 
                 WHERE taller_id = ?) 
            as places_totals_lliures
        `, [taller_id, taller_id]);

        return result[0].places_totals_lliures || 0;
    }
};

module.exports = AssignacioTaller;
