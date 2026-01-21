const Alumne = require('../../models/Alumne');
const db = require('../../config/db');

const alumnesController = {
    getAlumnes: async (req, res) => {
        try {
            const { id } = req.params; // peticio_detall_id
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
            const { nom_alumne } = req.body;

            if (!nom_alumne) {
                return res.status(400).json({ message: "El nom de l'alumne és obligatori." });
            }

            // Verificar límit d'alumnes
            // Primer obtenim el límit de la petició
            const [rows] = await db.query("SELECT num_participants FROM peticio_detalls WHERE id = ?", [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "Taller no trobat." });
            }
            const limit = rows[0].num_participants;

            // Després contem quants n'hi ha
            const currentCount = await Alumne.countByPeticioDetallId(id);

            if (currentCount >= limit) {
                return res.status(400).json({ message: `No es poden afegir més alumnes. Límit: ${limit}` });
            }

            const newAlumne = await Alumne.create(id, nom_alumne);
            res.status(201).json(newAlumne);

        } catch (error) {
            console.error('Error afegint alumne:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    },

    deleteAlumne: async (req, res) => {
        try {
            const { studentId } = req.params;
            const success = await Alumne.delete(studentId);

            if (!success) {
                return res.status(404).json({ message: "Alumne no trobat." });
            }

            res.json({ message: "Alumne eliminat correctament." });
        } catch (error) {
            console.error('Error eliminant alumne:', error);
            res.status(500).json({ message: 'Error al servidor.' });
        }
    }
};

module.exports = alumnesController;
