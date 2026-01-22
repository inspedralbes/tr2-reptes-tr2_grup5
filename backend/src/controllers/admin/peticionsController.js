const Peticio = require("../../models/Peticio");
const AssignacioTaller = require("../../models/AssignacioTaller");
const Taller = require("../../models/Taller"); // <--- IMPORTANTE: Importar el modelo Taller
const Log = require("../../models/Log");
const db = require("../../config/db");

const peticionsController = {
    // Obtenir totes les peticions amb filtres
    getAll: async (req, res) => {
        try {
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

    // Actualitzar l'estat d'un TALLER concret dins d'una petició
    updateTallerEstat: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos." });
            }

            const { id, taller_id } = req.params; // 'id' es el ID de la petición
            const { estat } = req.body;

            if (!['PENDENT', 'ASSIGNADA', 'REBUTJADA'].includes(estat)) {
                return res.status(400).json({ message: "Estat no vàlid." });
            }

            // --- LÒGICA DE PLACES AUTOMÀTICA ---
            // 1. Obtenir l'estat actual i participants abans de fer el canvi
            const [oldData] = await db.query(
                "SELECT estat, num_participants FROM peticio_detalls WHERE peticio_id = ? AND taller_id = ?",
                [id, taller_id]
            );

            if (!oldData[0]) return res.status(404).json({ message: "Detall no trobat." });
            
            const estatAnterior = oldData[0].estat;
            const participants = oldData[0].num_participants;

            // 2. Realitzar l'actualització de l'estat
            const success = await Peticio.updateEstat(id, taller_id, estat);

            if (success) {
                // 3. Sincronitzar places al model Taller
                // Si passem a ASSIGNADA: Restem
                if (estat === 'ASSIGNADA' && estatAnterior !== 'ASSIGNADA') {
                    await Taller.restarPlaces(taller_id, participants);
                } 
                // Si trèiem l'assignació: Sumem (devolvemos plazas)
                else if (estatAnterior === 'ASSIGNADA' && estat !== 'ASSIGNADA') {
                    await Taller.sumarPlaces(taller_id, participants);
                }

                await Log.create({
                    usuari_id: req.user.id,
                    accio: 'UPDATE_TALLER_STATUS',
                    taula_afectada: 'peticio_detalls',
                    valor_nou: { id, taller_id, estat }
                });
                res.json({ message: "Estat i places actualitzats correctament." });
            } else {
                res.status(404).json({ message: "No s'ha pogut actualitzar el detall." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al actualitzar l'estat." });
        }
    },

    // Controlador d'Acceptació (Assignació ràpida)
    assign: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per realitzar assignacions." });
            }

            const { peticio_id, taller_id } = req.body;

            const peticio = await Peticio.findById(peticio_id);
            if (!peticio) return res.status(404).json({ message: "Peticio no trobada." });

            const detall = peticio.detalls.find(d => d.taller_id == taller_id);
            if (!detall) return res.status(400).json({ message: "Aquest taller no forma part de la sol·licitud." });

            const numParticipants = detall.num_participants;
            const trimestre = detall.trimestre;

            // 1. Comprovar capacitat (usant AssignacioTaller com tenies)
            const capacitat = await AssignacioTaller.teCapacitatSuficient(taller_id, trimestre, numParticipants);
            if (!capacitat.valid) {
                return res.status(400).json({
                    message: "No hi ha places suficients.",
                    detalls: { lliures: capacitat.lliures }
                });
            }

            // 2. Marcar com ASSIGNADA
            await Peticio.updateEstat(peticio_id, taller_id, 'ASSIGNADA');

            // 3. ACTUALITZAR PLACES AL TALLER (Nou pas automàtic)
            await Taller.restarPlaces(taller_id, numParticipants);

            // 4. Gestió de Referents (el teu codi es manté)
            if (detall.es_preferencia_referent == 1 && detall.docent_email) {
                const [prof] = await db.query(`
                    SELECT p.id FROM professors p 
                    JOIN usuaris u ON p.user_id = u.id 
                    WHERE u.email = ?
                `, [detall.docent_email]);

                if (prof[0]) {
                    await db.query(
                        "INSERT IGNORE INTO referents_assignats (peticio_detall_id, professor_id) VALUES (?, ?)",
                        [detall.id, prof[0].id]
                    );
                }
            }

            // 5. Auditoria
            await Log.create({
                usuari_id: req.user.id,
                accio: 'ASSIGN_TALLER',
                taula_afectada: 'peticio_detalls',
                valor_nou: { peticio_id, taller_id, trimestre }
            });

            res.json({ message: "Taller assignat i places actualitzades correctament." });

        } catch (error) {
            console.error("Error en l'assignació:", error);
            res.status(500).json({ message: "Error al servidor." });
        }
    },

    // ... resta de funcions (getAssignmentDetails, delete) es mantenen igual ...
    getAssignmentDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const details = await AssignacioTaller.getAssignmentDetails(id);
            res.json(details);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtenir els detalls." });
        }
    },

    delete: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: "No tens permisos." });
            const { id } = req.params;
            const success = await Peticio.delete(id);
            if (success) {
                await Log.create({
                    usuari_id: req.user.id,
                    accio: 'DELETE_PETICIO',
                    taula_afectada: 'peticions',
                    valor_anterior: { id }
                });
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