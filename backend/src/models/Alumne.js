const db = require("../config/db");

const Alumne = {
    // Obtenir alumnes d'un taller assignat (peticio_detall_id)
    getByPeticioDetallId: async (peticioDetallId) => {
        const [rows] = await db.query(
            "SELECT * FROM assistencia_alumnes WHERE peticio_detall_id = ? ORDER BY cognoms, nom",
            [peticioDetallId]
        );
        return rows;
    },

    // Afegir un alumne individual (per compatibilitat)
    create: async (peticioDetallId, nom, cognoms, email) => {
        const [result] = await db.query(
            "INSERT INTO assistencia_alumnes (peticio_detall_id, nom, cognoms, email) VALUES (?, ?, ?, ?)",
            [peticioDetallId, nom, cognoms, email]
        );
        return { id: result.insertId, peticio_detall_id: peticioDetallId, nom, cognoms, email };
    },

    // Afegir múltiples alumnes
    createMany: async (peticioDetallId, alumnes) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const alumne of alumnes) {
                await connection.query(`
                    INSERT INTO assistencia_alumnes (peticio_detall_id, nom, cognoms, email, ha_assistit)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    peticioDetallId,
                    alumne.nom || '',
                    alumne.cognoms || '',
                    alumne.email || '',
                    (alumne.ha_assistit !== undefined) ? (alumne.ha_assistit ? 1 : 0) : 1
                ]);
            }
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Obtenir un alumne per ID
    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM assistencia_alumnes WHERE id = ?", [id]);
        return rows[0];
    },

    // Eliminar un alumne
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM assistencia_alumnes WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    // Contar quants alumnes hi ha en un taller
    countByPeticioDetallId: async (peticioDetallId) => {
        const [rows] = await db.query(
            "SELECT COUNT(*) as exact_count FROM assistencia_alumnes WHERE peticio_detall_id = ?",
            [peticioDetallId]
        );
        return rows[0].exact_count;
    },

    // Actualitzar l'avaluació d'un alumne
    updateAvaluacio: async (id, nota_tecnica, nota_actitud, comentaris) => {
        const [result] = await db.query(
            "UPDATE assistencia_alumnes SET nota_tecnica = ?, nota_actitud = ?, comentarios = ?, ha_avaluat = 1 WHERE id = ?",
            [nota_tecnica, nota_actitud, comentaris, id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Alumne;
