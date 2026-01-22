const db = require("../config/db");

const Peticio = {
    // --- NOUS MÈTODES PER A ESTADÍSTIQUES (AFEGITS) ---

    // Obté el rànquing de centres basat en activitat per a la pàgina d'estadístiques
    getCentresPrioritatRanking: async () => {
        const sql = `
            SELECT 
                c.nom_centre,
                COUNT(pd.id) as total_tallers,
                SUM(pd.num_participants) as total_alumnes
            FROM centres c
            JOIN peticions p ON c.id = p.centre_id
            JOIN peticio_detalls pd ON p.id = pd.peticio_id
            WHERE pd.estat = 'ASSIGNADA'
            GROUP BY c.id
            ORDER BY total_tallers DESC, total_alumnes ASC
            LIMIT 5
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Obté mètriques globals de centres i alumnes
    getCentresStats: async () => {
        const [rows] = await db.query(`
            SELECT 
                COUNT(DISTINCT p.centre_id) as total_centres,
                SUM(pd.num_participants) as total_alumnes,
                AVG(pd.num_participants) as media_alumnes
            FROM peticions p
            JOIN peticio_detalls pd ON p.id = pd.peticio_id
        `);

        const [trimTop] = await db.query(`
            SELECT trimestre, COUNT(*) as total 
            FROM peticio_detalls 
            GROUP BY trimestre 
            ORDER BY total DESC LIMIT 1
        `);

        return { 
            ...rows[0], 
            trimestreTop: trimTop[0]?.trimestre || 'N/A' 
        };
    },

    // --- CODI ORIGINAL RECUPERAT (PER A LA GESTIÓ D'ADMIN) ---

    create: async (infoPeticio, tallersDetalls) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [peticioResult] = await connection.query(
                "INSERT INTO peticions (centre_id) VALUES (?)",
                [infoPeticio.centre_id]
            );

            const peticio_id = peticioResult.insertId;

            // 2. Inserir els detalls a 'peticio_detalls' (amb trimestre i descripcio)
            if (tallersDetalls && tallersDetalls.length > 0) {
                const detallsSql = "INSERT INTO peticio_detalls (peticio_id, taller_id, trimestre, num_participants, prioritat, es_preferencia_referent, docent_nom, docent_email, descripcio) VALUES ?";
                const values = tallersDetalls.map(d => [
                    peticio_id,
                    d.taller_id,
                    d.trimestre,
                    d.num_participants > 4 ? 4 : d.num_participants,
                    d.prioritat || 1,
                    d.es_preferencia_referent ? 1 : 0,
                    d.docent_nom || null,
                    d.docent_email || null,
                    d.descripcio || null
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

    getByCentreId: async (centre_id) => {
        const [rows] = await db.query(`
      SELECT p.*, pd.id as detall_id, pd.taller_id, pd.trimestre, pd.num_participants, pd.prioritat, pd.es_preferencia_referent, pd.estat as detall_estat, pd.descripcio, t.titol as taller_titol
      FROM peticions p
      LEFT JOIN peticio_detalls pd ON p.id = pd.peticio_id
      LEFT JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ?
      ORDER BY p.data_creacio DESC
    `, [centre_id]);
        return rows;
    },

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

        if (filters.taller_id) { sql += " AND pd.taller_id = ?"; params.push(filters.taller_id); }
        if (filters.centre_id) { sql += " AND p.centre_id = ?"; params.push(filters.centre_id); }
        if (filters.modalitat) { sql += " AND t.modalitat = ?"; params.push(filters.modalitat); }
        if (filters.trimestre) { sql += " AND pd.trimestre = ?"; params.push(filters.trimestre); }
        if (filters.estat) { sql += " AND pd.estat = ?"; params.push(filters.estat); }

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

    delete: async (id) => {
        const [result] = await db.query("DELETE FROM peticions WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    updateEstat: async (peticio_id, taller_id, estat) => {
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

    rebutjarPerMancaDePlaces: async (taller_id, trimestre, places_disponibles) => {
        const sql = `
            UPDATE peticio_detalls pd
            SET pd.estat = 'REBUTJADA'
            WHERE pd.taller_id = ? 
              AND pd.trimestre = ?
              AND pd.estat = 'PENDENT' 
              AND pd.num_participants > ?
        `;
        const [result] = await db.query(sql, [taller_id, trimestre, places_disponibles]);
        return result.affectedRows;
    }
};

module.exports = Peticio;