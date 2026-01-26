// ======================================
// Importem les dependències
// ======================================

const Assistencia = require('../../models/Assistencia');
const Professor = require('../../models/Professor');
const AssignacioTaller = require('../../models/AssignacioTaller');
const db = require('../../config/db');

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador d'assistència (professors): Gestiona l'assistència als tallers

// ======================================
// Declaracions de funcions
// ======================================

const assistenciaController = {
    saveAssistencia: async (req, res) => {
        try {
            const peticio_detall_id = req.body.peticio_detall_id;
            const alumnes = req.body.alumnes;

            if (!peticio_detall_id || !Array.isArray(alumnes)) {
                return res.status(400).json({ message: 'Dades invàlides' });
            }

            // 1. Obtenir ID del professor logat
            const professor = await Professor.getByUserId(req.user.id);
            if (!professor) {
                return res.status(403).json({ message: "Professor no trobat." });
            }

            // 2. Comprovar si és referent per aquest taller
            // Només els referents poden passar llista
            const isReferent = await AssignacioTaller.isReferent(peticio_detall_id, professor.id);

            if (!isReferent) {
                return res.status(403).json({ message: "Només el professor referent pot passar llista." });
            }

            await Assistencia.saveList(peticio_detall_id, alumnes);
            res.status(201).json({ message: 'Assistència guardada correctament' });

        } catch (error) {
            console.error('Error guardant assistència:', error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    },

    getAssistencia: async (req, res) => {
        try {
            const id = req.params.id; // peticio_detall_id

            // 0. Recopilar dades usuari
            const professor = await Professor.getByUserId(req.user.id);
            if (!professor) return res.status(403).json({ message: "Professor no trobat" });

            // 1. Verificar si és Docent (ASSIGNED)
            const result = await db.query("SELECT docent_email FROM peticio_detalls WHERE id = ?", [id]);
            const rows = result[0];
            if (rows.length === 0) return res.status(404).json({ message: "Taller no trobat" });
            
            let isAssigned = false;
            if (rows[0].docent_email === req.user.email) {
                isAssigned = true;
            }

            // 2. Verificar si és Referent (REFERENT)
            const isReferent = await AssignacioTaller.isReferent(id, professor.id);

            if (!isAssigned && !isReferent) {
                return res.status(403).json({ message: "No tens permís per veure aquesta assistència." });
            }

            const assistencia = await Assistencia.getByDetallId(id);
            res.json(assistencia);
        } catch (error) {
            console.error('Error obtenint assistència:', error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const id = req.params.id; // id del registre d'assistència
            const ha_assistit = req.body.ha_assistit;

            // Validació bàsica
            if (typeof ha_assistit === 'undefined') {
                return res.status(400).json({ message: 'Dades invàlides' });
            }

            const updated = await Assistencia.updateStatus(id, ha_assistit);
            if (!updated) {
                return res.status(404).json({ message: 'Registre no trobat' });
            }

            res.json({ message: 'Estat actualitzat correctament' });
        } catch (error) {
            console.error('Error actualitzant assistència:', error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    }
};

module.exports = assistenciaController;
