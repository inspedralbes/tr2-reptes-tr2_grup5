// ======================================
// Importem les dependències
// ======================================

const Log = require("../../models/Log");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de logs: Gestiona la consulta dels logs d'auditoria per a l'administrador

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els logs d'auditoria ---
const getLogs = async (req, res) => {
  try {
    // 1. Cridar el model per obtenir tots els logs
    const llista = await Log.getAll();

    // 2. Retornar la llista en format JSON
    res.json(llista);
  } catch (error) {
    console.error("Error al obtenir els logs d'auditoria:", error);
    res.status(500).json({ message: "Error al obtenir els logs d'auditoria." });
  }
};

module.exports = {
  getLogs
};
