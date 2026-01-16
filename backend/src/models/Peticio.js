const db = require("../config/db");

const Peticio = {
    // Crear una nova petició amb els seus detalls 
    create: async (peticioData, tallersDetalls) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Inserir a la taula 'peticions'
            const { centre_id, trimestre, disponibilitat_dimarts, comentaris } = peticioData;
            const [peticioResult] = await connection.query(
                "INSERT INTO peticions (centre_id, trimestre, disponibilitat_dimarts, comentaris) VALUES (?, ?, ?, ?)",
                [centre_id, trimestre, disponibilitat_dimarts, comentaris]
            );

            const peticio_id = peticioResult.insertId;

            // 2. Inserir els detalls a 'peticio_detalls'
            if (tallersDetalls && tallersDetalls.length > 0) {
                const detallsSql = "INSERT INTO peticio_detalls (peticio_id, taller_id, num_participants, es_preferencia_referent, docent_nom, docent_email) VALUES ?";
                const values = tallersDetalls.map(d => [
                    peticio_id,
                    d.taller_id,
                    d.num_participants > 4 ? 4 : d.num_participants,
                    d.es_preferencia_referent ? 1 : 0,
                    d.docent_nom || null,
                    d.docent_email || null
                ]);
                await connection.query(detallsSql, [values]);
            }



            await connection.commit();
            return peticio_id;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Obtenir peticions d'un centre
    getByCentreId: async (centre_id) => {
        const [rows] = await db.query(`
      SELECT p.*, pd.taller_id, pd.num_participants, pd.es_preferencia_referent, t.titol as taller_titol
      FROM peticions p
      LEFT JOIN peticio_detalls pd ON p.id = pd.peticio_id
      LEFT JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ?
      ORDER BY p.data_creacio DESC
    `, [centre_id]);
        return rows;
    },

    // ADMIN: Obtenir totes les peticions amb filtres
    getAllAdmin: async (filters = {}) => {
        let sql = `
            SELECT DISTINCT p.*, c.nom_centre
            FROM peticions p
            JOIN centres c ON p.centre_id = c.id
            JOIN peticio_detalls pd ON p.id = pd.peticio_id
            JOIN tallers t ON pd.taller_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.taller_id) {
            sql += " AND pd.taller_id = ?";
            params.push(filters.taller_id);
        }
        if (filters.centre_id) {
            sql += " AND p.centre_id = ?";
            params.push(filters.centre_id);
        }
        if (filters.modalitat) {
            sql += " AND t.modalitat = ?";
            params.push(filters.modalitat);
        }
        if (filters.trimestre) {
            sql += " AND p.trimestre = ?";
            params.push(filters.trimestre);
        }
        if (filters.estat) {
            sql += " AND p.estat = ?";
            params.push(filters.estat);
        }

        sql += " ORDER BY p.data_creacio DESC";

        const [rows] = await db.query(sql, params);

        // Per cada petició, portem els seus detalls
        // (Nota: Podriem fer-ho tot en una query, però per simplicitat ho fem així ara)
        const enrichedRows = await Promise.all(rows.map(async (p) => {
            const [detalls] = await db.query(`
                SELECT pd.*, t.titol, t.modalitat 
                FROM peticio_detalls pd
                JOIN tallers t ON pd.taller_id = t.id
                WHERE pd.peticio_id = ?
            `, [p.id]);
            return { ...p, detalls };
        }));

        return enrichedRows;
    },

    // ADMIN: Buscar per ID amb detalls
    findById: async (id) => {
        const [peticio] = await db.query(`
            SELECT p.*, c.nom_centre 
            FROM peticions p 
            JOIN centres c ON p.centre_id = c.id 
            WHERE p.id = ?
        `, [id]);

        if (!peticio[0]) return null;

        const [detalls] = await db.query(`
            SELECT pd.*, t.titol, t.modalitat 
            FROM peticio_detalls pd 
            JOIN tallers t ON pd.taller_id = t.id 
            WHERE pd.peticio_id = ?
        `, [id]);

        return { ...peticio[0], detalls };
    },

    // ADMIN: Actualitzar estat
    updateEstat: async (id, estat) => {
        const [result] = await db.query("UPDATE peticions SET estat = ? WHERE id = ?", [estat, id]);
        return result.affectedRows > 0;
    },

    // ADMIN: Eliminar petició
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM peticions WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    // ADMIN: Rebutjar automàticament peticions que ja no caben
    rebutjarPerMancaDePlaces: async (taller_id, places_disponibles) => {
        const sql = `
            UPDATE peticions p
            JOIN peticio_detalls pd ON p.id = pd.peticio_id
            SET p.estat = 'REBUTJADA'
            WHERE pd.taller_id = ? 
              AND p.estat = 'PENDENT' 
              AND pd.num_participants > ?
        `;
        const [result] = await db.query(sql, [taller_id, places_disponibles]);
        return result.affectedRows;
    },

    // ADMIN: Anul·lar la preferència de referent d'un detall concret
    anullarPreferenciaReferent: async (peticio_id, taller_id) => {
        const [result] = await db.query(
            "UPDATE peticio_detalls SET es_preferencia_referent = 0 WHERE peticio_id = ? AND taller_id = ?",
            [peticio_id, taller_id]
        );
        return result.affectedRows > 0;
    }
,
    // ADMIN: Actualitzar l'estat d'un detall (taller) dins d'una petició
    updateDetallEstat: async (peticio_id, taller_id, estat) => {
        const [result] = await db.query(
            "UPDATE peticio_detalls SET estat = ? WHERE peticio_id = ? AND taller_id = ?",
            [estat, peticio_id, taller_id]
        );
        return result.affectedRows > 0;
    },

    // ADMIN: Recalcular i actualitzar l'estat global de la petició segons els detalls
    recomputeEstat: async (peticio_id) => {
        // Comptem quants detalls estan en cada estat
        const [rows] = await db.query(
            `SELECT 
                SUM(CASE WHEN COALESCE(estat,'PENDENT') = 'PENDENT' THEN 1 ELSE 0 END) as pendents,
                SUM(CASE WHEN estat = 'ASSIGNADA' THEN 1 ELSE 0 END) as assignades,
                SUM(CASE WHEN estat = 'REBUTJADA' THEN 1 ELSE 0 END) as rebutjades
             FROM peticio_detalls WHERE peticio_id = ?`,
            [peticio_id]
        );

        const stats = rows[0];
        let nouEstat = 'PENDENT';
        if (stats.pendents == 0 && stats.assignades > 0) {
            nouEstat = 'ASSIGNADA';
        } else if (stats.pendents == 0 && stats.assignades == 0 && stats.rebutjades > 0) {
            nouEstat = 'REBUTJADA';
        }

        await db.query("UPDATE peticions SET estat = ? WHERE id = ?", [nouEstat, peticio_id]);
        return nouEstat;
    }
};

module.exports = Peticio;
