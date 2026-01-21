const db = require("../config/db");

const Peticio = {
    // Crear una nova petició amb els seus detalls 
    create: async (peticioData, tallersDetalls) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Inserir a la taula 'peticions'
            const { centre_id, trimestre, disponibilitat_dimarts } = peticioData;
            const [peticioResult] = await connection.query(
                "INSERT INTO peticions (centre_id, trimestre, disponibilitat_dimarts) VALUES (?, ?, ?)",
                [centre_id, trimestre, disponibilitat_dimarts]
            );

            const peticio_id = peticioResult.insertId;

            // 2. Inserir els detalls a 'peticio_detalls'
            if (tallersDetalls && tallersDetalls.length > 0) {
                const detallsSql = "INSERT INTO peticio_detalls (peticio_id, taller_id, num_participants, prioritat, es_preferencia_referent, docent_nom, docent_email, descripcio) VALUES ?";
                const values = tallersDetalls.map(d => [
                    peticio_id,
                    d.taller_id,
                    d.num_participants > 4 ? 4 : d.num_participants,
                    d.prioritat || 1,
                    d.es_preferencia_referent ? 1 : 0,
                    d.docent_nom || null,
                    d.docent_email || null,
                    d.comentaris || null
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

    // Obtenir peticions d'un centre //TODO: OBTENIR DETALLS SE PETICIONS D'UN CENTRE
    getByCentreId: async (centre_id) => {
        const [rows] = await db.query(`
      SELECT p.*, pd.id as detall_id, pd.taller_id, pd.num_participants, pd.prioritat, pd.es_preferencia_referent, pd.estat as detall_estat, t.titol as taller_titol
      FROM peticions p
      LEFT JOIN peticio_detalls pd ON p.id = pd.peticio_id
      LEFT JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ?
      ORDER BY pd.prioritat ASC
    `, [centre_id]);
        return rows;
    },

    // ADMIN: Obtenir totes les peticions amb filtres //TODO: OBTENIR TOTS ELS DETALLS DE PETICIONS
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
            sql += " AND pd.estat = ?";
            params.push(filters.estat);
        }

        sql += " ORDER BY p.data_creacio DESC";

        const [rows] = await db.query(sql, params);

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


    // ADMIN: Eliminar petició sencera
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM peticions WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    // ADMIN: Actualitzar l'estat d'un taller dins d'una petició
    updateEstat: async (peticio_id, taller_id, estat) => {
        // Validar que l'estat sigui vàlid
        const estatsValids = ['PENDENT', 'ASSIGNADA', 'REBUTJADA'];
        if (!estatsValids.includes(estat)) {
            throw new Error(`Estat no vàlid: ${estat}. Ha de ser un de: ${estatsValids.join(', ')}`);
        }

        const [result] = await db.query(
            "UPDATE peticio_detalls SET estat = ? WHERE peticio_id = ? AND taller_id = ?",
            [estat, peticio_id, taller_id]
        );
        return result.affectedRows > 0;
    },

    // ADMIN: Rebutjar automàticament detalls que ja no caben en un trimestre
    rebutjarPerMancaDePlaces: async (taller_id, trimestre, places_disponibles) => {
        const sql = `
            UPDATE peticio_detalls pd
            JOIN peticions p ON pd.peticio_id = p.id
            SET pd.estat = 'REBUTJADA'
            WHERE pd.taller_id = ? 
              AND p.trimestre = ?
              AND pd.estat = 'PENDENT' 
              AND pd.num_participants > ?
        `;
        const [result] = await db.query(sql, [taller_id, trimestre, places_disponibles]);
        return result.affectedRows;
    }
};

module.exports = Peticio;
