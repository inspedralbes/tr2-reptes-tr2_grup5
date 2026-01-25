const Config = require("../../models/Config");

// Obtenir l'estat del període d'inscripció
// Ara comprova si la data actual està dins del rang definit
const getEnrollmentStatus = async (req, res) => {
  try {
    const startConfig = await Config.get('enrollment_start');
    const endConfig = await Config.get('enrollment_end');
    const manualConfig = await Config.get('periode_inscripcio'); // Mantem l'interruptor manual com a "override" opcional o deprecated?
    
    // Si tenim dates definides, la lògica es basa en les dates
    let isOpenByDates = false;
    let startDate = null;
    let endDate = null;

    if (startConfig && endConfig) {
      const now = new Date();
      // Reset time to midnight to compare dates correctly
      now.setHours(0,0,0,0);
      
      startDate = new Date(startConfig.valor);
      endDate = new Date(endConfig.valor);
      
      // Ensure we compare purely dates without conflicting timezones if strings are YYYY-MM-DD
      // But keeping simple Date comparison:
      isOpenByDates = now >= startDate && now <= endDate;
    }

    // Prioritat: Si hi ha manual config 'tancat' forçat? O simplement 'dates'.
    // El usuari demana "aquells dies l'estat passi a ser...".
    // Fem que la lògica sigui: Si estem en dates => OBERT.
    // O podríem mantenir l'interruptor manual per tancar d'emergència.
    // Per simplificar i complir el requisit: Dates manen.
    
    res.json({ 
      isOpen: isOpenByDates,
      startDate: startConfig ? startConfig.valor : null,
      endDate: endConfig ? endConfig.valor : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEnrollmentDates = async (req, res) => {
  try {
    const { start, end } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({ message: "Cal indicar data d'inici i final." });
    }

    await Config.set('enrollment_start', start);
    await Config.set('enrollment_end', end);

    res.json({ message: "Dates d'inscripció actualitzades correctament.", start, end });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEnrollmentStatus,
  updateEnrollmentDates,
  toggleEnrollmentStatus: async (req, res) => {
      res.status(400).json({ message: "Utilitza el calendari per definir el període." });
  }
};
