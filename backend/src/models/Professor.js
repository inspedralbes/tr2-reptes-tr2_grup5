// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Professor: Gestiona les operacions relacionades amb la taula 'professors'

// ======================================
// Declaracions de funcions
// ======================================

const Professor = {
  // A) --- Obtenir tots els professors d'un centre ---
  getByCentreId: async (centre_id) => {
    // 1. Executem la consulta SQL per obtenir els professors
    const result = await db.query(`
      SELECT p.id, p.nom, p.cognoms, u.email 
      FROM professors p
      LEFT JOIN usuaris u ON p.user_id = u.id
      WHERE p.centre_id = ?
    `, [centre_id]);
    const rows = result[0];
    
    // 2. Retornem els resultats
    return rows;
  },

  // A) --- Crear un nou professor (crea usuari i professor en transacció) ---
  create: async (data) => {
    // 1. Obtenim les dades del professor
    const nom = data.nom;
    const cognoms = data.cognoms;
    const email = data.email;
    const centre_id = data.centre_id;
    
    // 2. Obtenim una connexió de la base de dades
    const connection = await db.getConnection();

    try {
      // 3. Iniciem una transacció
      await connection.beginTransaction();
      
      // 4. Creem l'usuari associat al professor
      const passwordHash = '$2b$10$HnZFrfVpo1WxpnO64di7X.HW4/d/KSi0Lzt4zN5Yc4dL2nQdHfoF4dW';
      const rol = 'PROFESSOR';
      const resultUser = await connection.query(`
        INSERT INTO usuaris (email, password, rol)
        VALUES (?, ?, ?)
      `, [email, passwordHash, rol]);
      const userResult = resultUser[0];
      const newUserId = userResult.insertId;

      // 5. Creem el professor vinculat a l'usuari
      const resultProf = await connection.query(`
        INSERT INTO professors (nom, cognoms, user_id, centre_id)
        VALUES (?, ?, ?, ?)
      `, [nom, cognoms, newUserId, centre_id]);
      const profResult = resultProf[0];

      // 6. Confirmem la transacció
      await connection.commit();

      // 7. Construïm l'objecte de resposta
      const resposta = {};
      resposta.professorId = profResult.insertId;
      resposta.userId = newUserId;

      // 8. Retornem la resposta
      return resposta;

    } catch (error) {
      // 9. En cas d'error, fem rollback
      await connection.rollback();
      console.error("Error en la transacció de creació de professor:", error);
      throw error;
    } finally {
      // 10. Alliberem la connexió
      connection.release();
    }
  }
};

module.exports = Professor;
