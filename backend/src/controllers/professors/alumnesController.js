const Alumne = require('../../models/Alumne');
const Professor = require('../../models/Professor');
const AssignacioTaller = require('../../models/AssignacioTaller');
const db = require('../../config/db');

const alumnesController = {
    getAlumnes: async (req, res) => {
        try {
            const { id } = req.params; // peticio_detall_id

            // 0. Recopilar dades usuari
            const professor = await Professor.getByUserId(req.user.id);
            if (!professor) return res.status(403).json({ message: "Professor no trobat" });

            // 1. Verificar si és Docent (ASSIGNED)
            const [rows] = await db.query("SELECT docent_email FROM peticio_detalls WHERE id = ?", [id]);
            if (!rows.length) return res.status(404).json({ message: "Taller no trobat" });
            const isAssigned = rows[0].docent_email === req.user.email;

            // 2. Verificar si és Referent (REFERENT)
            const isReferent = await AssignacioTaller.isReferent(id, professor.id);

            // 3. Si no és cap dels dos, fora
            if (!isAssigned && !isReferent) {
                return res.status(403).json({ message: "No tens permís per veure aquest llistat." });
            }

            const alumnes = await Alumne.getByPeticioDetallId(id);
            res.json(alumnes);
        } catch (error) {
            console.error('Error obtenint alumnes:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    },

    addAlumne: async (req, res) => {
        try {
            const { id } = req.params; // peticio_detall_id
            const { nom_alumne, alumnes } = req.body;

            // Suport per un sol alumne (legacy) o array (batch)
            const alumnesToAdd = alumnes || (nom_alumne ? [{ nom: nom_alumne, cognoms: '', email: '', ha_assistit: true }] : []);

            if (alumnesToAdd.length === 0) {
                return res.status(400).json({ message: "No s'han proporcionat dades d'alumnes." });
            }

            // Verificar límit d'alumnes i permís de docent
            // Primer obtenim dades de la petició i verifiquem docent
            const [rows] = await db.query("SELECT num_participants, docent_email FROM peticio_detalls WHERE id = ?", [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "Taller no trobat." });
            }
            const { num_participants, docent_email } = rows[0];

            // 1. Verificació de permís: Només el docent assignat pot afegir alumnes
            if (docent_email !== req.user.email) {
                return res.status(403).json({ message: "No tens permís per gestionar la llista d'aquest taller." });
            }

            // 2. Verificació de límit
            const currentCount = await Alumne.countByPeticioDetallId(id);
            const remaining = num_participants - currentCount;

            if (alumnesToAdd.length > remaining) {
                return res.status(400).json({ message: `No es poden afegir ${alumnesToAdd.length} alumnes. Només queden ${remaining} places.` });
            }

            if (alumnes) {
                await Alumne.createMany(id, alumnes);
                res.status(201).json({ message: "Alumnes afegits correctament." });
            } else {
                // Compatible amb el format anterior
                const newAlumne = await Alumne.create(id, nom_alumne, '', '');
                res.status(201).json(newAlumne);
            }

        } catch (error) {
            console.error('Error afegint alumne:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    },

    deleteAlumne: async (req, res) => {
        try {
            const { studentId } = req.params;

            // 1. Obtenir info del alumne per saber el taller
            const alumne = await Alumne.getById(studentId);
            if (!alumne) {
                return res.status(404).json({ message: "Alumne no trobat." });
            }
            const peticio_detall_id = alumne.peticio_detall_id;

            // 2. Verificar permís (mateixa lògica que addAlumne: només docent assignat)
            const [tallerRows] = await db.query("SELECT docent_email FROM peticio_detalls WHERE id = ?", [peticio_detall_id]);
            if (!tallerRows.length) return res.status(404).json({ message: "Taller associat no trobat." });

            if (tallerRows[0].docent_email !== req.user.email) {
                return res.status(403).json({ message: "No tens permís per eliminar alumnes d'aquest la llista." });
            }

            const success = await Alumne.delete(studentId);

            res.json({ message: "Alumne eliminat correctament." });
        } catch (error) {
            console.error('Error eliminant alumne:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    },

    saveReview: async (req, res) => {
        try {
            const { id, studentId } = req.params; // id=tallerId, studentId=studentId
            const { avaluacio, comentarios, nota_tecnica, nota_actitud } = req.body;

            // 1. Obtenir info del alumne per saber el taller
            const alumne = await Alumne.getById(studentId);
            if (!alumne) {
                return res.status(404).json({ message: "Alumne no trobat." });
            }
            const peticio_detall_id = alumne.peticio_detall_id;

            // 2. Verificar permís (només docent assignat)
            const [tallerRows] = await db.query("SELECT docent_email FROM peticio_detalls WHERE id = ?", [peticio_detall_id]);
            if (!tallerRows.length) return res.status(404).json({ message: "Taller associat no trobat." });

            if (tallerRows[0].docent_email !== req.user.email) {
                return res.status(403).json({ message: "No tens permís per avaluar alumnes d'aquest taller." });
            }

            // 3. Guardar
            await Alumne.updateAvaluacio(
                studentId,
                nota_tecnica || 0,
                nota_actitud || 0,
                comentarios !== undefined ? comentarios : avaluacio
            );
            res.json({ message: "Avaluació guardada correctament." });

        } catch (error) {
            console.error('Error guardant avaluació:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    }
};

module.exports = alumnesController;
