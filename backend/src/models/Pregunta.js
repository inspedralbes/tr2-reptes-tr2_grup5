const db = require("../config/db");

const Pregunta = {
  getByEnquestaId: async (enquestaId) => {
    const [rows] = await db.query("SELECT * FROM preguntes WHERE enquesta_id = ?", [enquestaId]);
    return rows;
  },

  create: async (data) => {
    const { enquesta_id, text_pregunta, tipus } = data;
    const sql = "INSERT INTO preguntes (enquesta_id, text_pregunta, tipus) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [enquesta_id, text_pregunta, tipus]);
    return result.insertId;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM preguntes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM preguntes WHERE id = ?", [id]);
    return rows[0];
  }
};

module.exports = Pregunta;
