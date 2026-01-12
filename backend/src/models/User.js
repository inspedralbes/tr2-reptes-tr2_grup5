const db = require("../config/db");

const User = {
  // Buscar un usuario por ID
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM usuaris WHERE id = ?", [id]);
    return rows[0];
  },

  // Buscar un usuari per email (Login)
  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM usuaris WHERE email = ?", [email]);
    return rows[0];
  },

  // Crear un nou usuari amb contrasenya hashejada (Registre)
  create: async (userData) => {
    const { email, password, rol } = userData;
    const [result] = await db.query(
      "INSERT INTO usuaris (email, password, rol, ultim_acces) VALUES (?, ?, ?, NOW())",
      [email, password, rol]
    );
    return result.insertId;
  }
,
  // Obtener todos los usuarios (sin password) y datos básicos del centre si existe
  getAll: async () => {
    const sql = `
      SELECT
        u.id AS id,
        u.email AS email,
        u.rol AS rol,
        u.ultim_acces AS ultim_acces,
        c.id AS centre_id,
        c.codi_centre AS codi_centre,
        c.nom_centre AS nom_centre
      FROM usuaris u
      LEFT JOIN centres c ON c.user_id = u.id
      ORDER BY u.ultim_acces DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
};

module.exports = User;
