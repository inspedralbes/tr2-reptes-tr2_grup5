const db = require("../config/db");

const Alumne = {
    // Obtenir alumnes d'un taller assignat (peticio_detall_id)
    getByPeticioDetallId: async (peticioDetallId) => {
        const [rows] = await db.query(
            "SELECT * FROM alumnes_taller WHERE peticio_detall_id = ? ORDER BY data_afegir DESC",
            [peticioDetallId]
        );
        return rows;
    },

    // Afegir un alumne al taller
    create: async (peticioDetallId, nomAlumne) => {
        const [result] = await db.query(
            "INSERT INTO alumnes_taller (peticio_detall_id, nom_alumne) VALUES (?, ?)",
            [peticioDetallId, nomAlumne]
        );
        return { id: result.insertId, peticio_detall_id: peticioDetallId, nom_alumne: nomAlumne };
    },

    // Eliminar un alumne
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM alumnes_taller WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    // Contar quants alumnes hi ha en un taller
    countByPeticioDetallId: async (peticioDetallId) => {
        const [rows] = await db.query(
            "SELECT COUNT(*) as exact_count FROM alumnes_taller WHERE peticio_detall_id = ?",
            [peticioDetallId]
        );
        return rows[0].exact_count;
    }
};

module.exports = Alumne;
