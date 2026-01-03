const db = require("../config/db");

// Model de Alumne
// Encarna la lògica d'accés a dades per a la taula 'alumnes'
const Alumne = {
    // Buscar per ID
    findById: async (id) => {
        const [rows] = await db.query("SELECT * FROM alumnes WHERE id = ?", [id]);
        return rows[0];
    },

    // Crear un nou alumne
    create: async (data) => {
        const {
            idalu,
            nom,
            cognoms,
            centre_id,
            curs_actual
        } = data;

        const sql = `
      INSERT INTO alumnes 
      (idalu, nom, cognoms, centre_id, curs_actual) 
      VALUES (?, ?, ?, ?, ?)
    `;

        const [result] = await db.query(sql, [
            idalu,
            nom,
            cognoms,
            centre_id,
            curs_actual
        ]);

        return result.insertId;
    },

    // Buscar per IDALU (identificador únic alumne)
    findByIdalu: async (idalu) => {
        const [rows] = await db.query("SELECT * FROM alumnes WHERE idalu = ?", [idalu]);
        return rows[0];
    },

    // Assignar alumne a un taller (grup d'assignació)
    assignToGroup: async (alumneId, assignacioTallerId) => {
        const sql = "INSERT INTO assignacions_alumnes (alumne_id, assignacio_taller_id) VALUES (?, ?)";
        const [result] = await db.query(sql, [alumneId, assignacioTallerId]);
        return result.affectedRows > 0;
    },

    // Comptar quants alumnes té un centre en tallers d'una modalitat específica
    // (Validació Model C: Màxim 12 alumnes)
    countByCentreAndModalitat: async (centreId, modalitat) => {
        const sql = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM alumnes a
      JOIN assignacions_alumnes aa ON a.id = aa.alumne_id
      JOIN assignacions_tallers at ON aa.assignacio_taller_id = at.id
      JOIN tallers t ON at.taller_id = t.id
      WHERE a.centre_id = ? 
        AND t.modalitat = ?
        AND at.estat IN ('ACTIU', 'PENDENT')
    `;

        const [rows] = await db.query(sql, [centreId, modalitat]);
        return rows[0].total;
    }
};

module.exports = Alumne;
