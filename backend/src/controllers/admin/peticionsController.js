const Peticio = require("../../models/Peticio");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Log = require("../../models/Log");

const peticionsController = {
    // Obtenir totes les peticions amb filtres
    getAll: async (req, res) => {
        try {
            // Validació PERMISOS ADMIN
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per veure totes les peticions." });
            }

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
            // Validació PERMISOS ADMIN
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per veure aquesta sol·licitud." });
            }

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

    // Actualitzar l'estat d'un taller específic dins d'una petició
    updateTallerEstat: async (req, res) => {
        try {
            // Permisos ADMIN
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per modificar l'estat dels tallers." });
            }

            const { peticioId, tallerId } = req.params;
            const { estat, assignacio_taller_id } = req.body;

            if (!['PENDENT', 'ASSIGNADA', 'REBUTJADA'].includes(estat)) {
                return res.status(400).json({ message: "Estat no vàlid. Ha de ser 'PENDENT', 'ASSIGNADA' o 'REBUTJADA'." });
            }

            // Recuperem la petició i el detall
            const peticio = await Peticio.findById(peticioId);
            if (!peticio) return res.status(404).json({ message: "Peticio no trobada." });

            const detall = peticio.detalls.find(d => d.taller_id == tallerId);
            if (!detall) return res.status(404).json({ message: "Aquest taller no forma part de la sol·licitud." });

            // Guardem l'estat anterior per l'auditoria
            const estatAnterior = detall.estat || 'PENDENT';

            // Si es vol ASSIGNAR, cal assignacio_taller_id i comprovar capacitat
            if (estat === 'ASSIGNADA') {
                if (!assignacio_taller_id) {
                    return res.status(400).json({ message: "Cal proporcionar 'assignacio_taller_id' per assignar aquest taller a un grup." });
                }

                const numParticipants = detall.num_participants;

                const capacitat = await AssignacioTaller.teCapacitatSuficient(assignacio_taller_id, numParticipants);
                if (!capacitat.valid) {
                    return res.status(400).json({ message: capacitat.message || 'No hi ha places suficients en aquest grup.', detalls: { demanades: numParticipants, lliures: capacitat.lliures } });
                }

                // Realitzem la inserció a peticions_tallers_assignats
                await AssignacioTaller.realitzarAssignacio({
                    peticio_id: peticioId,
                    taller_id: tallerId,
                    assignacio_taller_id: assignacio_taller_id,
                    num_participants: numParticipants
                });
            }

            // IMPORTANT: No actualitzem la columna 'estat' a peticio_detalls perquè la BD d'execució pot no tenir-la.
            // En lloc d'això només registrem en l'auditoria l'intent/canvi.
            await Log.create({
                usuari_id: req.user.id,
                accio: 'UPDATE_DETALL_STATUS',
                taula_afectada: 'peticio_detalls',
                valor_anterior: { peticio_id: peticioId, taller_id: tallerId, estat: estatAnterior },
                valor_nou: { peticio_id: peticioId, taller_id: tallerId, estat }
            });

            // Nota: no intentem recalcular l'estat global de la petició perquè això depèn de la columna 'estat' en peticio_detalls.

            // Si hem assignat, també registrem un log específic per la taula d'assignacions
            if (estat === 'ASSIGNADA') {
                await Log.create({
                    usuari_id: req.user.id,
                    accio: 'ASSIGN_TALLER_SINGLE',
                    taula_afectada: 'peticions_tallers_assignats',
                    valor_nou: { peticio_id: peticioId, taller_id: tallerId, assignacio_taller_id }
                });
            }

            res.json({ message: 'Estat del taller processat (no modificat a BD per compatibilitat).', estat_peticio: null });
        } catch (error) {
            console.error('Error actualitzant estat del taller:', error);
            res.status(500).json({ message: 'Error al servidor al actualitzar l\'estat del taller.' });
        }
    },

    // Actualitzar l'estat d'una petició
    updateEstat: async (req, res) => {
        try {
            // 1. Validar PERMISOS ADMIN
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per modificar l'estat de les sol·licituds." });
            }

            const { id } = req.params;
            const { estat } = req.body;

            if (!['PENDENT', 'ASSIGNADA', 'REBUTJADA'].includes(estat)) {
                return res.status(400).json({ message: "Estat no vàlid. Ha de ser 'PENDENT', 'ASSIGNADA' o 'REBUTJADA'." });
            }

            // Recuperem l'estat anterior per a l'auditoria
            const peticioAntiga = await Peticio.findById(id);
            if (!peticioAntiga) {
                return res.status(404).json({ message: "No s'ha trobat la sol·licitud." });
            }

            const success = await Peticio.updateEstat(id, estat);
            if (success) {
                // 2. REGISTRAR AUDITORIA
                await Log.create({
                    usuari_id: req.user.id,
                    accio: 'UPDATE_STATUS',
                    taula_afectada: 'peticions',
                    valor_anterior: { estat: peticioAntiga.estat },
                    valor_nou: { estat: estat, peticio_id: id }
                });

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
            // 1. Validar PERMISOS ADMIN
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per realitzar assignacions." });
            }

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

            // --- REGISTRAR AUDITORIA D'ASSIGNACIÓ ---
            await Log.create({
                usuari_id: req.user.id,
                accio: 'ASSIGN_TALLER',
                taula_afectada: 'peticions_tallers_assignats',
                valor_nou: {
                    peticio_id,
                    taller_id,
                    assignacio_taller_id,
                    participants: numParticipantsQueDemanen
                }
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

    // Obtenir els grups disponibles per a un taller (assignacions)
    getGrupsPerTaller: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tens permisos.' });
            const { tallerId } = req.params;
            const grups = await AssignacioTaller.getGrupsPerTaller(tallerId);
            res.json(grups);
        } catch (error) {
            console.error('Error obtenint grups per taller:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    },

    // Eliminar una petició
    delete: async (req, res) => {
        try {
            // Validació PERMISOS ADMIN
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per eliminar sol·licituds." });
            }

            const { id } = req.params;
            const success = await Peticio.delete(id);
            if (success) {
                // REGISTRAR AUDITORIA
                await Log.create({
                    usuari_id: req.user.id,
                    accio: 'DELETE_PETICIO',
                    taula_afectada: 'peticions',
                    valor_anterior: { id }
                });

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
