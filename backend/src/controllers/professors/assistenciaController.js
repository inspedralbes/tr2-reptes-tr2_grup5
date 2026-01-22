const Assistencia = require('../../models/Assistencia');

const assistenciaController = {
    saveAssistencia: async (req, res) => {
        try {
            const { peticio_detall_id, alumnes } = req.body;

            if (!peticio_detall_id || !Array.isArray(alumnes)) {
                return res.status(400).json({ message: 'Dades invàlides' });
            }

            // Aquí podríem afegir verificació: assegurar que el taller pertany al profe logat req.user.email
            // Per ara confiem en que el frontend envia el ID correcte i el user està autenticat.

            await Assistencia.saveList(peticio_detall_id, alumnes);
            res.status(201).json({ message: 'Assistència guardada correctament' });

        } catch (error) {
            console.error('Error guardant assistència:', error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    },

    getAssistencia: async (req, res) => {
        try {
            const { id } = req.params; // peticio_detall_id
            const assistencia = await Assistencia.getByDetallId(id);
            res.json(assistencia);
        } catch (error) {
            console.error('Error obtenint assistència:', error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params; // id del registre d'assistència (alumne)
            const { ha_assistit } = req.body;

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
