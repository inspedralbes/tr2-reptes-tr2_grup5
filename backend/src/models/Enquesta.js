const db = require("../config/db");

const Enquesta = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM enquestes");
    return rows;
  },

  create: async (data) => {
    const { titol, destinatari } = data;
    const sql = "INSERT INTO enquestes (titol, destinatari) VALUES (?, ?)";
    const [result] = await db.query(sql, [titol, destinatari]);
    return result.insertId;
  },

  delete: async (id) => {
    // Gràcies al ON DELETE CASCADE a la BBDD, això també esborrarà les preguntes
    const [result] = await db.query("DELETE FROM enquestes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM enquestes WHERE id = ?", [id]);
    return rows[0];
  }
};

module.exports = Enquesta;
