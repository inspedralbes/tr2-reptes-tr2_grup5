// ======================================
// Importem les dependències
// ======================================

const Config = require("../../models/Config");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de configuració (admin): Dates d'inscripció

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir l'estat del període d'inscripció ---
const getEnrollmentStatus = async (req, res) => {
  try {
    const startConfig = await Config.get('enrollment_start');
    const endConfig = await Config.get('enrollment_end');
    
    // 1. Si tenim dates definides, la lògica es basa en les dates
    let isOpenByDates = false;
    
    if (startConfig && endConfig) {
      const now = new Date();
      // Reset time to midnight to compare dates correctly
      now.setHours(0,0,0,0);
      
      const startDate = new Date(startConfig.valor);
      const endDate = new Date(endConfig.valor);
      
      if (now >= startDate && now <= endDate) {
        isOpenByDates = true;
      }
    }
    
    // 2. Retornem l'estat i les dates
    const response = {};
    response.isOpen = isOpenByDates;
    
    if (startConfig) {
        response.startDate = startConfig.valor;
    } else {
        response.startDate = null;
    }
    
    if (endConfig) {
        response.endDate = endConfig.valor;
    } else {
        response.endDate = null;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// B) --- Actualitzar les dates d'inscripció ---
const updateEnrollmentDates = async (req, res) => {
  try {
    const start = req.body.start;
    const end = req.body.end;
    
    if (!start || !end) {
      return res.status(400).json({ message: "Cal indicar data d'inici i final." });
    }

    await Config.set('enrollment_start', start);
    await Config.set('enrollment_end', end);

    res.json({ message: "Dates d'inscripció actualitzades correctament.", start: start, end: end });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleEnrollmentStatus = async (req, res) => {
    res.status(400).json({ message: "Utilitza el calendari per definir el període." });
};

module.exports = {
  getEnrollmentStatus,
  updateEnrollmentDates,
  toggleEnrollmentStatus
};
