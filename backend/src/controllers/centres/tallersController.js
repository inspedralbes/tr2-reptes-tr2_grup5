const db = require("../../config/db");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Centre = require("../../models/Centre");

const Config = require("../../models/Config");

//--- 1. GET: OBTENIR TOTS ELS TALLERS DISPONIBLES PER A CENTRES ---
const getAllTallersDisponibles = async (req, res) => {
  try {
    // 1. Get Enrollment Config
    const startConfig = await Config.get('enrollment_start');
    const endConfig = await Config.get('enrollment_end');
    const manualConfig = await Config.get('periode_inscripcio');

    // 2. Check if we are in enrollment period
    let isEnrollmentOpen = manualConfig ? manualConfig.valor === 'obert' : false;
    
    if (startConfig && endConfig && startConfig.valor && endConfig.valor) {
        const now = new Date();
        now.setHours(0,0,0,0);
        const start = new Date(startConfig.valor);
        const end = new Date(endConfig.valor);
        
        if (now >= start && now <= end) {
            isEnrollmentOpen = true;
        } else {
            // If strictly date based, we might want to say it's closed even if manual switch was open?
            // But let's assume dual logic: Open if dates match OR manual switch is ON.
             if (now < start || now > end) {
                 isEnrollmentOpen = false;
             }
        }
    }

    // 3. Fetch Workshops
    // Show 'actiu' OR 'inscripcio'. Usually admin sets them to 'actiu' and we create the window.
    const [rows] = await db.query("SELECT * FROM tallers WHERE estat_taller IN ('actiu', 'inscripcio')");
    
    // 4. Transform Status if Enrollment Open
    // User requested: "aquells dies l'estat dels tallers passi a ser inscripció"
    if (isEnrollmentOpen) {
        const modifiedRows = rows.map(t => ({
            ...t,
            estat_taller: 'inscripcio' // Override status dynamically for the frontend
        }));
        return res.json(modifiedRows);
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//--- 2. GET: OBTENIR Talls ASSIGNATS AL CENTRE LOGUEJAT ---
const getMevesAssignacions = async (req, res) => {
  try {
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

module.exports = {
  getAllTallersDisponibles,
  getMevesAssignacions
};
