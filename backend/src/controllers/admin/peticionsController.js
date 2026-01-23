// ======================================
// Importem les dependències
// ======================================

const Peticio = require("../../models/Peticio");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Taller = require("../../models/Taller");
const Log = require("../../models/Log");
const db = require("../../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de peticions (admin): Gestió de sol·licituds de tallers

// ======================================
// Declaracions de funcions
// ======================================

const peticionsController = {
  // A) --- Obtenir totes les peticions amb filtres ---
  getAll: async (req, res) => {
    try {
      if (req.user.rol !== "ADMIN") {
        return res.status(403).json({ message: "No tens permisos per veure totes les peticions." });
      }

      // 1. Obtenim els filtres de la query
      const taller_id = req.query.taller_id;
      const centre_id = req.query.centre_id;
      const modalitat = req.query.modalitat;
      const trimestre = req.query.trimestre;
      const estat = req.query.estat;
      const filters = {
        taller_id: taller_id,
        centre_id: centre_id,
        modalitat: modalitat,
        trimestre: trimestre,
        estat: estat
      };

      // 2. Obtenim les peticions i les retornem
      const peticions = await Peticio.getAllAdmin(filters);
      res.json(peticions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtenir les peticions." });
    }
  },

  // B) --- Obtenir una petició per ID ---
  getById: async (req, res) => {
    try {
      if (req.user.rol !== "ADMIN") {
        return res.status(403).json({ message: "No tens permisos per veure aquesta sol·licitud." });
      }

      // 1. Obtenim l'ID dels paràmetres
      const id = req.params.id;

      const peticio = await Peticio.findById(id);
            if (!peticio) {
                return res.status(404).json({ message: "Sol·licitud no trobada." });
            }
            res.json(peticio);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtenir la sol·licitud." });
        }
    },

  // C) --- Actualitzar l'estat d'un taller concret dins d'una petició ---
  updateTallerEstat: async (req, res) => {
    try {
      if (req.user.rol !== "ADMIN") {
        return res.status(403).json({ message: "No tens permisos." });
      }

      // 1. Obtenim els paràmetres (id és el ID de la petició)
      const id = req.params.id;
      const taller_id = req.params.taller_id;
      const estat = req.body.estat;

      if (!["PENDENT", "ASSIGNADA", "REBUTJADA"].includes(estat)) {
        return res.status(400).json({ message: "Estat no vàlid." });
      }

      // 2. Obtenir l'estat actual i participants abans de fer el canvi
      const resOld = await db.query(
        "SELECT estat, num_participants FROM peticio_detalls WHERE peticio_id = ? AND taller_id = ?",
        [id, taller_id]
      );
      const oldData = resOld[0];

      if (!oldData[0]) {
        return res.status(404).json({ message: "Detall no trobat." });
      }

      const estatAnterior = oldData[0].estat;
      const participants = oldData[0].num_participants;

      // 3. Realitzar l'actualització de l'estat
      const success = await Peticio.updateEstat(id, taller_id, estat);

      if (success) {
        // 4. Sincronitzar places al model Taller
        if (estat === "ASSIGNADA" && estatAnterior !== "ASSIGNADA") {
          await Taller.restarPlaces(taller_id, participants);
        } else if (estatAnterior === "ASSIGNADA" && estat !== "ASSIGNADA") {
          await Taller.sumarPlaces(taller_id, participants);
        }

        // 5. Registrem el log d'auditoria
        try {
          const txtAnterior = "Detall petició id " + id + ", taller id " + taller_id + ", estat anterior: '" + estatAnterior + "'.";
          const txtNou = "Estat actualitzat a '" + estat + "' per la petició id " + id + ", taller id " + taller_id + ".";
          await Log.create({
            usuari_id: req.user.id,
            accio: "UPDATE_TALLER_STATUS",
            taula_afectada: "peticio_detalls",
            valor_anterior: txtAnterior,
            valor_nou: txtNou
          });
        } catch (logErr) {
          console.error("Error creant log d'auditoria:", logErr.message);
        }
        res.json({ message: "Estat i places actualitzats correctament." });
      } else {
        res.status(404).json({ message: "No s'ha pogut actualitzar el detall." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualitzar l'estat." });
    }
  },

  // D) --- Assignar un taller a una petició (assignació ràpida) ---
  assign: async (req, res) => {
    try {
      if (req.user.rol !== "ADMIN") {
        return res.status(403).json({ message: "No tens permisos per realitzar assignacions." });
      }

      // 1. Obtenim peticio_id i taller_id del cos
      const peticio_id = req.body.peticio_id;
      const taller_id = req.body.taller_id;

      const peticio = await Peticio.findById(peticio_id);
      if (!peticio) {
        return res.status(404).json({ message: "Peticio no trobada." });
      }

      // 2. Busquem el detall que coincideix amb el taller_id (bucle for)
      let detall = null;
      for (let i = 0; i < peticio.detalls.length; i++) {
        if (peticio.detalls[i].taller_id == taller_id) {
          detall = peticio.detalls[i];
          break;
        }
      }
      if (!detall) {
        return res.status(400).json({ message: "Aquest taller no forma part de la sol·licitud." });
      }

      const numParticipants = detall.num_participants;
      const trimestre = detall.trimestre;

      // 3. Comprovar capacitat
      const capacitat = await AssignacioTaller.teCapacitatSuficient(taller_id, trimestre, numParticipants);
      if (!capacitat.valid) {
        return res.status(400).json({
          message: "No hi ha places suficients.",
          detalls: { lliures: capacitat.lliures }
        });
      }

      // 4. Marcar com ASSIGNADA
      await Peticio.updateEstat(peticio_id, taller_id, "ASSIGNADA");

      // 5. Actualitzar places al taller
      await Taller.restarPlaces(taller_id, numParticipants);

      // 6. Gestió de referents
      if (detall.es_preferencia_referent == 1 && detall.docent_email) {
        const resRef = await db.query(`
          SELECT COUNT(DISTINCT ra.professor_id) as count
          FROM referents_assignats ra
          JOIN peticio_detalls pd ON ra.peticio_detall_id = pd.id
          WHERE pd.taller_id = ? AND pd.trimestre = ? AND pd.estat = 'ASSIGNADA'
        `, [taller_id, trimestre]);
        const rowsRef = resRef[0];
        let numReferents = 0;
        if (rowsRef[0] && rowsRef[0].count !== undefined) {
          numReferents = rowsRef[0].count;
        }

        if (numReferents >= 2) {
          await db.query(
            "UPDATE peticio_detalls SET es_preferencia_referent = 0 WHERE id = ?",
            [detall.id]
          );
          console.warn("No s'assigna referent per " + detall.id + ": ja hi ha 2 referents assignats al taller " + taller_id + " en el trimestre " + trimestre);
        } else {
          const resProf = await db.query(`
            SELECT p.id FROM professors p 
            JOIN usuaris u ON p.user_id = u.id 
            WHERE u.email = ?
          `, [detall.docent_email]);
          const rowsProf = resProf[0];

          if (rowsProf[0]) {
            await db.query(
              "INSERT IGNORE INTO referents_assignats (peticio_detall_id, professor_id) VALUES (?, ?)",
              [detall.id, rowsProf[0].id]
            );
          }
        }
      }

      // 7. Registrem el log d'auditoria
      try {
        const txtAnterior = "Petició id " + peticio_id + ", taller id " + taller_id + ", trimestre '" + trimestre + "', estat: PENDENT.";
        const txtNou = "Assignat el taller id " + taller_id + " a la petició id " + peticio_id + " (trimestre " + trimestre + ").";
        await Log.create({
          usuari_id: req.user.id,
          accio: "ASSIGN_TALLER",
          taula_afectada: "peticio_detalls",
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }

      res.json({ message: "Taller assignat i places actualitzades correctament." });
    } catch (error) {
      console.error("Error en l'assignació:", error);
      res.status(500).json({ message: "Error al servidor." });
    }
  },

  // E) --- Obtenir els detalls d'una assignació ---
  getAssignmentDetails: async (req, res) => {
    try {
      const id = req.params.id;
      const details = await AssignacioTaller.getAssignmentDetails(id);
      res.json(details);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtenir els detalls." });
    }
  },

  // F) --- Eliminar una petició ---
  delete: async (req, res) => {
    try {
      if (req.user.rol !== "ADMIN") {
        return res.status(403).json({ message: "No tens permisos." });
      }
      const id = req.params.id;

            const peticio = await Peticio.findById(id);
            if (!peticio) return res.status(404).json({ message: "No trobada." });

            const success = await Peticio.delete(id);
            if (success) {
                try {
                    const txtAnterior = "Petició id " + peticio.id + ", centre_id " + (peticio.centre_id || '') + ", abans d'eliminar.";
                    const txtNou = "Eliminada la petició id " + peticio.id + ".";
                    await Log.create({
                        usuari_id: req.user.id,
                        accio: 'DELETE_PETICIO',
                        taula_afectada: 'peticions',
                        valor_anterior: txtAnterior,
                        valor_nou: txtNou
                    });
                } catch (logErr) {
                    console.error("Error creant log d'auditoria:", logErr.message);
                }
                res.json({ message: "Sol·licitud eliminada." });
            } else {
                res.status(404).json({ message: "No trobada." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al eliminar." });
        }
    }
};

module.exports = peticionsController;