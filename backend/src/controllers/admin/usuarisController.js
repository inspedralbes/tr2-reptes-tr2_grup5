const User = require("../../models/User");
const Log = require("../../models/Log");

// --- ADMIN: Obtener todos los usuarios ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();

    // Opcional: auditar la consulta
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null,
        accio: 'READ',
        taula_afectada: 'usuaris',
        valor_anterior: null
      });
    } catch (e) {
      // no bloqueamos la respuesta si falla la auditoría
      console.error('Audit log failed:', e.message);
    }

    res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuaris." });
  }
};

module.exports = {
  getAllUsers
};
