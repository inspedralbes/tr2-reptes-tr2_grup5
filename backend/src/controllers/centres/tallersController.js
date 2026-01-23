// ======================================
// Importem les dependències
// ======================================

const db = require("../../config/db");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Centre = require("../../models/Centre");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de tallers (centres): Llistar tallers disponibles i assignacions del centre

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els tallers disponibles per a centres ---
const getAllTallersDisponibles = async (req, res) => {
  try {
    // 1. Executem la consulta
    const result = await db.query("SELECT * FROM tallers WHERE actiu = 1");
    const rows = result[0];

    // 2. Retornem les files
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// B) --- Obtenir les assignacions del centre loguejat ---
const getMevesAssignacions = async (req, res) => {
  try {
    // Verificació de seguretat per evitar Error 500 si no hi ha middleware
    if (!req.user) {
      return res.status(401).json({ message: "Sessió no vàlida o falta el token." });
    }

    const user_id = req.user.id;
    const centre = await Centre.findByUserId(user_id);

    if (!centre) {
      return res.status(404).json({ message: "No s'ha trobat el perfil de centre." });
    }

    const assignacions = await AssignacioTaller.getByCentreId(centre.id);
    res.json(assignacions);
  } catch (error) {
    console.error("Error al obtenir assignacions del centre:", error);
    res.status(500).json({ message: "Error al recuperar les teves assignacions." });
  }
};

//--- 3. GET: OBTENIR EL DETALL D'UNA ASSIGNACIÓ ESPECÍFICA (ID) ---
const getAssignacioById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuari no autenticat." });
    }

    const { id } = req.params;
    const user_id = req.user.id;
    
    // Obtenim el centre loguejat per validar propietat
    const centre = await Centre.findByUserId(user_id);
    if (!centre) {
      return res.status(404).json({ message: "Perfil de centre no trobat." });
    }

    // Busquem l'assignació al model
    const assignacio = await AssignacioTaller.getById(id);

    if (!assignacio) {
      return res.status(404).json({ message: "Aquesta assignació no existeix al sistema." });
    }

    // SEGURETAT: Verifiquem que l'ID del centre de l'assignació coincideixi amb el del centre loguejat
    if (String(assignacio.centre_id) !== String(centre.id)) {
      return res.status(403).json({ message: "No tens permís per accedir a aquesta informació." });
    }

    res.json(assignacio);
  } catch (error) {
    // Si et surt Error 500, mira el que posarà aquí a la teva terminal de Node:
    console.error("❌ ERROR a getAssignacioById:", error);
    res.status(500).json({ 
      message: "Error intern del servidor.", 
      debug: error.message 
    });
  }
};

module.exports = {
  getAllTallersDisponibles,
  getMevesAssignacions,
  getAssignacioById
};