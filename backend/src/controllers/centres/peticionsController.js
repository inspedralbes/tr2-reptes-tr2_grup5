const Peticio = require("../../models/Peticio");
const Centre = require("../../models/Centre");
const Config = require("../../models/Config"); // Import Config model

const peticionsController = {
    // Crear una nova sol·licitud de tallers
    createPeticio: async (req, res) => {
        try {
            // --- VALIDACIÓ PERÍODE D'INSCRIPCIÓ ---
            const config = await Config.get('periode_inscripcio');
            const isEnrollmentOpen = config ? config.valor === 'obert' : false;

            if (!isEnrollmentOpen) {
                return res.status(403).json({ 
                    message: "Aquests dies no hi han tallers per presentar, has d'esperar a que obrin les inscripcions." 
                });
            }
            // ---------------------------------------

            const user_id = req.user.id; // Obtingut del token JWT
            const { tallers } = req.body;

            // 1. Trobar el centre associat a l'usuari loguejat
            const centre = await Centre.findByUserId(user_id);
            if (!centre) {
                return res.status(404).json({ message: "No s'ha trobat el perfil de centre per a aquest usuari." });
            }

            // 2. Validacions bàsiques
            if (!tallers || !Array.isArray(tallers) || tallers.length === 0) {
                return res.status(400).json({ message: "Cal especificar almenys un taller." });
            }

            // 3. Validar que cada taller tingui els camps necessaris
            for (const taller of tallers) {
                if (!taller.taller_id || !taller.trimestre) {
                    return res.status(400).json({ 
                        message: "Cada taller ha de tenir 'taller_id' i 'trimestre' especificats." 
                    });
                }
            }

            // 4. Crear la petició (només amb centre_id)
            const peticioData = {
                centre_id: centre.id
            };

            const peticioId = await Peticio.create(peticioData, tallers);

            res.status(201).json({
                message: "Sol·licitud de tallers creada correctament.",
                id: peticioId
            });
        } catch (error) {
            console.error("Error al crear petició de tallers:", error);
            res.status(500).json({ message: "Error al processar la sol·licitud de tallers." });
        }
    },

    // Obtenir les sol·licituds del centre loguejat
    getMevesPeticions: async (req, res) => {
        try {
            const user_id = req.user.id;
            const centre = await Centre.findByUserId(user_id);

            if (!centre) {
                return res.status(404).json({ message: "No s'ha trobat el perfil de centre." });
            }

            const rows = await Peticio.getByCentreId(centre.id);

            // Agrupar per peticio_id si cal, o retornar pla
            res.json(rows);
        } catch (error) {
            console.error("Error al obtenir peticions:", error);
            res.status(500).json({ message: "Error al obtenir el llistat de sol·licituds." });
        }
    }
};

module.exports = peticionsController;
