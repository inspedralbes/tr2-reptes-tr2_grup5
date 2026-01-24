const db = require("../config/db");

const Config = {
  // Obtenir una configuració per clau
  get: async (clau) => {
    const [rows] = await db.query("SELECT * FROM configuracio WHERE clau = ?", [clau]);
    return rows[0];
  },

  // Actualitzar o crear una configuració
  set: async (clau, valor) => {
    const existing = await Config.get(clau);
    if (existing) {
      const [result] = await db.query("UPDATE configuracio SET valor = ? WHERE clau = ?", [valor, clau]);
      return result.affectedRows > 0;
    } else {
      const [result] = await db.query("INSERT INTO configuracio (clau, valor) VALUES (?, ?)", [clau, valor]);
      return result.insertId;
    }
  },

  // Obtenir totes les configuracions
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM configuracio");
    return rows;
  }
};

module.exports = Config;
