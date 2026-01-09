const db = require("../config/db");

const SolicitudRegistre = {
    // Obtenir totes les sol·licituds
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM solicituds_registre ORDER BY data_enviament DESC");
        return rows;
    },

    // Crear una nova sol·licitud
    create: async (data) => {
        const {
            codi_centre,
            nom_centre,
            nom_centre_manual,
            password,
            adreca,
            municipi,
            telefon,
            email_centre,
            nom_coordinador,
            email_coordinador,
            es_primera_vegada
        } = data;

        const sql = `
      INSERT INTO solicituds_registre 
      (codi_centre, nom_centre, nom_centre_manual, password, adreca, municipi, telefon, email_centre, nom_coordinador, email_coordinador, es_primera_vegada) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Si nom_centre és 'Altres', es_primera_vegada es forçarà al controlador, però aqui ho guardem tal qual arriba
        const [result] = await db.query(sql, [
            codi_centre,
            nom_centre,
            nom_centre_manual || null,
            password,
            adreca,
            municipi,
            telefon,
            email_centre,
            nom_coordinador,
            email_coordinador,
            es_primera_vegada ? 1 : 0
        ]);

        return result.insertId;
    },

    // Actualitzar una sol·licitud per ID
    update: async (id, data) => {
        const sql = `
      UPDATE solicituds_registre SET 
      codi_centre = ?,
      nom_centre = ?,
      nom_centre_manual = ?,
      password = ?,
      adreca = ?,
      municipi = ?,
      telefon = ?,
      email_centre = ?,
      nom_coordinador = ?,
      email_coordinador = ?,
      es_primera_vegada = ?,
      estat = ?
      WHERE id = ?
    `;

        const [result] = await db.query(sql, [
            data.codi_centre,
            data.nom_centre,
            data.nom_centre_manual || null,
            data.password,
            data.adreca,
            data.municipi,
            data.telefon,
            data.email_centre,
            data.nom_coordinador,
            data.email_coordinador,
            data.es_primera_vegada ? 1 : 0,
            data.estat,
            id
        ]);

        return result.affectedRows > 0;
    },

    // Eliminar
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM solicituds_registre WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    // FindByID
    findById: async (id) => {
        const [rows] = await db.query("SELECT * FROM solicituds_registre WHERE id = ?", [id]);
        return rows[0];
    },

    // Validacions
    findByEmailCoordinador: async (email) => {
        const [rows] = await db.query("SELECT * FROM solicituds_registre WHERE email_coordinador = ?", [email]);
        return rows[0];
    },

    findByCodiCentre: async (codi) => {
        const [rows] = await db.query("SELECT * FROM solicituds_registre WHERE codi_centre = ?", [codi]);
        return rows[0];
    }
};

module.exports = SolicitudRegistre;
