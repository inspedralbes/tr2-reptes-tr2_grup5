const Peticio = require("../../models/Peticio");
const AssignacioTaller = require("../../models/AssignacioTaller");
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

            const { id, taller_id } = req.params;
            const { estat } = req.body;

            if (!['PENDENT', 'ASSIGNADA', 'REBUTJADA'].includes(estat)) {
                return res.status(400).json({ message: "Estat no vàlid." });
            }

            const success = await Peticio.updateEstat(id, taller_id, estat);
            if (success) {
                await Log.create({
                    usuari_id: req.user.id,
                    accio: 'UPDATE_TALLER_STATUS',
                    taula_afectada: 'peticio_detalls',
                    valor_nou: { id, taller_id, estat }
                });
                res.json({ message: "Estat del taller actualitzat correctament." });
            } else {
                res.status(404).json({ message: "No s'ha trobat el detall." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al actualitzar l'estat." });
        }
    },

    // Controlador d'Acceptació (Directament al Taller)
    assign: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per realitzar assignacions." });
            }

            const { peticio_id, taller_id } = req.body;

            const peticio = await Peticio.findById(peticio_id);
            if (!peticio) {
                return res.status(404).json({ message: "Peticio no trobada." });
            }

            const detall = peticio.detalls.find(d => d.taller_id == taller_id);
            if (!detall) {
                return res.status(400).json({ message: "Aquest taller no forma part de la sol·licitud." });
            }

            const numParticipants = detall.num_participants;
            const trimestre = peticio.trimestre;

            // 1. Comprovar capacitat
            const capacitat = await AssignacioTaller.teCapacitatSuficient(taller_id, trimestre, numParticipants);
            if (!capacitat.valid) {
                return res.status(400).json({
                    message: "No hi ha places suficients en aquest taller per al trimestre triat.",
                    detalls: { lliures: capacitat.lliures }
                });
            }

            // 2. Marcar com ASSIGNADA
            await Peticio.updateEstat(peticio_id, taller_id, 'ASSIGNADA');

            // 3. Gestió de Referents
            if (detall.es_preferencia_referent == 1 && detall.docent_email) {
                const numReferents = await AssignacioTaller.getReferentsCount(detall.id);
                if (numReferents < 2) {
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
            }

            // 4. Auditoria
            await Log.create({
                usuari_id: req.user.id,
                accio: 'ASSIGN_TALLER',
                taula_afectada: 'peticio_detalls',
                valor_nou: { peticio_id, taller_id, trimestre }
            });

            // 5. Neteja automàtica
            const lliures = await AssignacioTaller.getPlacesLliuresTotals(taller_id, trimestre);
            await Peticio.rebutjarPerMancaDePlaces(taller_id, trimestre, lliures);

            res.json({ message: "Taller assignat correctament." });

        } catch (error) {
            console.error("Error en l'assignació:", error);
            res.status(500).json({ message: "Error al servidor." });
        }
    },

    // Obtenir detalls d'una assignació (per ID de detall de petició)
    getAssignmentDetails: async (req, res) => {
        try {
            const { id } = req.params; // és detall_id

            if (req.user.rol === 'CENTRE') {
                const [hasAccess] = await db.query(`
                    SELECT 1 FROM peticio_detalls pd
                    JOIN peticions p ON pd.peticio_id = p.id
                    JOIN centres c ON p.centre_id = c.id
                    WHERE pd.id = ? AND c.user_id = ?
                `, [id, req.user.id]);

                if (!hasAccess[0]) {
                    return res.status(403).json({ message: "No tens permís per veure aquest taller." });
                }
            }

            const details = await AssignacioTaller.getAssignmentDetails(id);
            res.json(details);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtenir els detalls." });
        }
    },

    // Eliminar una petició sencera
    delete: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos." });
            }

            const { id } = req.params;
            const success = await Peticio.delete(id);
            if (success) {
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
