const db = require("../config/db");

const User = {
  // Buscar un usuario por ID
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM usuaris WHERE id = ?", [id]);
    return rows[0];
  }
};

module.exports = User;
