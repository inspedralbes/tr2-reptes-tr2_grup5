// ======================================
// Importem les dependències
// ======================================

const Peticio = require("../../models/Peticio");
const Centre = require("../../models/Centre");
const Config = require("../../models/Config"); // Import Config model

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de peticions (centres): Crear peticions i obtenir les del centre

// ======================================
// Declaracions de funcions
// ======================================

const peticionsController = {
  // A) --- Crear una nova sol·licitud de tallers ---
  createPeticio: async (req, res) => {
    try {
      // 0. Validar Període d'Inscripció
      const config = await Config.get('periode_inscripcio');
      const isEnrollmentOpen = config ? config.valor === 'obert' : false;
      
      // NOTA: Si vols ser estricte també amb dates aquí, pots replicar la lògica del tallersController
      // Per ara, usem només la config manual o confiem que el frontend ja filtra.
      // D'altra banda, si el frontend envia la petició, normalment assumim que es pot.
      // Per consistència amb el missatge d'error de l'altre branca:
      if (!isEnrollmentOpen) {
         // Comprovem dates també per seguretat si la config manual falla
         const startConfig = await Config.get('enrollment_start');
         const endConfig = await Config.get('enrollment_end');
         if (startConfig && endConfig && startConfig.valor && endConfig.valor) {
            const now = new Date();
            now.setHours(0,0,0,0);
            const start = new Date(startConfig.valor);
            const end = new Date(endConfig.valor);
            if (now >= start && now <= end) {
               // Estem en dates, així que permetem-ho encara que 'periode_inscripcio' no digui 'obert' explícitament
               // (O actualitzem isEnrollmentOpen a true)
            } else {
               return res.status(403).json({ 
                 message: "Aquests dies no hi han tallers per presentar, has d'esperar a que obrin les inscripcions." 
               });
            }
         } else {
             // Si no hi ha dates i manual està tancat -> Error
             return res.status(403).json({ 
                 message: "Aquests dies no hi han tallers per presentar, has d'esperar a que obrin les inscripcions." 
             });
         }
      }

      // 1. Obtenim l'ID de l'usuari des del token JWT
      const user_id = req.user.id;
      const tallers = req.body.tallers;

      // 2. Trobar el centre associat a l'usuari loguejat
      const centre = await Centre.findByUserId(user_id);
      if (!centre) {
        return res.status(404).json({ message: "No s'ha trobat el perfil de centre per a aquest usuari." });
      }

      // 3. Validacions bàsiques
      if (!tallers || !Array.isArray(tallers) || tallers.length === 0) {
        return res.status(400).json({ message: "Cal especificar almenys un taller." });
      }

      // 4. Validar que cada taller tingui els camps necessaris (bucle for clàssic)
      for (let i = 0; i < tallers.length; i++) {
        const taller = tallers[i];
        if (!taller.taller_id || !taller.trimestre) {
          return res.status(400).json({
            message: "Cada taller ha de tenir 'taller_id' i 'trimestre' especificats."
          });
        }
      }

      // 5. Crear la petició (només amb centre_id)
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

  // B) --- Obtenir les sol·licituds del centre loguejat ---
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
