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
  // Obtener todos los usuarios (sin password)
  getAll: async () => {
    const [rows] = await db.query("SELECT id, email, rol FROM usuaris ORDER BY ultim_acces DESC");
    return rows;
  }
};

module.exports = User;
