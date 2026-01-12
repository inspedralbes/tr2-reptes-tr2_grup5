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

    // Normalitzar la resposta per enviar només els camps que el frontend espera
    const normalized = (Array.isArray(users) ? users : []).map(u => ({
      id: u.id,
      email: u.email,
      rol: u.rol,
      ultim_acces: u.ultim_acces,
      nom_centre: u.nom_centre || null
    }));

    res.json(normalized);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuaris." });
  }
};

module.exports = {
  getAllUsers
};
