const Peticio = require("../../models/Peticio");
const AssignacioTaller = require("../../models/AssignacioTaller");

const peticionsController = {
    // Obtenir totes les peticions amb filtres
    getAll: async (req, res) => {
        try {
            const { taller_id, centre_id, modalitat, trimestre, estat } = req.query;
            const filters = { taller_id, centre_id, modalitat, trimestre, estat };

            const peticions = await Peticio.getAllAdmin(filters);
            res.json(peticions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtenir les peticions." });
        }
    },

    // Obtenir una petició per ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
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

    // Actualitzar l'estat d'una petició
    updateEstat: async (req, res) => {
        try {
            const { id } = req.params;
            const { estat } = req.body;

            if (!['PENDENT', 'ASSIGNADA', 'REBUTJADA'].includes(estat)) {
                return res.status(400).json({ message: "Estat no vàlid. Ha de ser 'PENDENT', 'ASSIGNADA' o 'REBUTJADA'." });
            }

            const success = await Peticio.updateEstat(id, estat);
            if (success) {
                res.json({ message: "Estat actualitzat correctament." });
            } else {
                res.status(404).json({ message: "No s'ha trobat la sol·licitud." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al actualitzar la sol·licitud." });
        }
    },

    // --- NOVA LÒGICA D'ASSIGNACIÓ AMB CONTROL DE PLACES ---
    assignarTallerAInstitut: async (req, res) => {
        try {
            const { peticio_id, taller_id, assignacio_taller_id } = req.body;

            // 1. Obtenir les dades de la petició per saber quants participants demana
            const peticio = await Peticio.findById(peticio_id);
            if (!peticio) return res.status(404).json({ message: "Peticio no trobada." });

            const detall = peticio.detalls.find(d => d.taller_id == taller_id);
            if (!detall) return res.status(400).json({ message: "Aquest taller no forma part de la sol·licitud." });

            const numParticipantsQueDemanen = detall.num_participants;

            // 2. Comprovar capacitat utilitzant el nou mètode del model
            const capacitat = await AssignacioTaller.teCapacitatSuficient(assignacio_taller_id, numParticipantsQueDemanen);

            if (!capacitat.valid) {
                return res.status(400).json({
                    message: capacitat.message || "No hi ha places suficients en aquest grup.",
                    detalls: {
                        demanades: numParticipantsQueDemanen,
                        lliures: capacitat.lliures,
                        ocupacio_actual: capacitat.ocupat,
                        maxim: capacitat.maxim
                    }
                });
            }

            // 3. Tot correcte -> Realitzar l'assignació
            await AssignacioTaller.realitzarAssignacio({
                peticio_id,
                taller_id,
                assignacio_taller_id,
                num_participants: numParticipantsQueDemanen
            });

            // 4. Control de Professors Referents (Màxim 2 per grup)
            let referentMessage = "";
            if (detall.es_preferencia_referent == 1) {
                const numReferentsActuals = await AssignacioTaller.getReferentsCount(assignacio_taller_id);

                if (numReferentsActuals >= 2) {
                    // Si ja hi ha 2, anul·lem la preferència d'aquesta petició
                    await Peticio.anullarPreferenciaReferent(peticio_id, taller_id);
                    referentMessage = " (La preferència de referent s'ha anul·lat perquè el grup ja té 2 professors assignats)";
                } else {
                    // Aquí en un futur es podria vincular oficialment el professor a la taula 'referents_assignats'
                    referentMessage = " (Professor manté la preferència de referent)";
                }
            }

            // 5. Neteja automàtica: Rebutjar peticions que ja no caben
            const placesLliuresTotals = await AssignacioTaller.getPlacesLliuresTotals(taller_id);
            await Peticio.rebutjarPerMancaDePlaces(taller_id, placesLliuresTotals);

            res.json({
                message: `Taller assignat correctament al grup. Places reservades${referentMessage}.`
            });

        } catch (error) {
            console.error("Error en l'assignació:", error);
            res.status(500).json({ message: "Error al servidor al realitzar l'assignació." });
        }
    },

    // Eliminar una petició
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await Peticio.delete(id);
            if (success) {
                res.json({ message: "Sol·licitud eliminada correctament." });
            } else {
                res.status(404).json({ message: "No s'ha trobat la sol·licitud." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al eliminar la sol·licitud." });
        }
    }
};

module.exports = peticionsController;
