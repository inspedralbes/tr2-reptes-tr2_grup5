const db = require("../config/db");

const Professor = {
    getByCentreId: async (centre_id) => {
        const [rows] = await db.query(`
            SELECT p.id, p.nom, p.cognoms, u.email 
            FROM professors p
            LEFT JOIN usuaris u ON p.user_id = u.id
            WHERE p.centre_id = ?
        `, [centre_id]);
        return rows;
    },

    create: async (data) => {
        const { nom, cognoms, email, centre_id } = data;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            const [userResult] = await connection.query(`
                INSERT INTO usuaris (email, password, rol)
                VALUES (?, ?, ?)
            `, [email, '$2b$10$HnZFrfVpo1WxpnO64di7X.HW4/d/KSi0Lzt4zN5Yc4dL2nQdHfoF4dW', 'PROFESSOR']);

            const newUserId = userResult.insertId;
            const [profResult] = await connection.query(`
                INSERT INTO professors (nom, cognoms, user_id, centre_id)
                VALUES (?, ?, ?, ?)
            `, [nom, cognoms, newUserId, centre_id]);

            await connection.commit();

            return {
                professorId: profResult.insertId,
                userId: newUserId
            };

        } catch (error) {
            await connection.rollback();
            console.error("Error en la transacció de creació de professor:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // Buscar professor pel seu user_id (per saber qui està fent login)
    getByUserId: async (user_id) => {
        const [rows] = await db.query("SELECT * FROM professors WHERE user_id = ?", [user_id]);
        return rows[0];
    },

    // Obtenir els tallers assignats a un professor (mitjançant l'email del docent a peticio_detalls)
    getAssignedTallers: async (email) => {
        const sql = `
            SELECT t.*, pd.estat as estat_assignacio, p.trimestre, pd.id as detall_id, pd.docent_nom, pd.docent_email
            FROM peticio_detalls pd
            JOIN tallers t ON pd.taller_id = t.id
            JOIN peticions p ON pd.peticio_id = p.id
            WHERE pd.docent_email = ? AND pd.estat = 'ASSIGNADA'
            ORDER BY p.data_creacio DESC
        `;
        const [rows] = await db.query(sql, [email]);
        return rows;
    }
};

module.exports = Professor;