const SolicitudRegistre = require('../models/SolicitudRegistre');
const bcrypt = require('bcryptjs');

const solicitudRegistreController = {
    // PUBLIC: Crear una nova sol·licitud
    create: async (req, res) => {
        try {
            const data = req.body;

            // 1. Validació bàsica
            if (!data.codi_centre || !data.nom_centre || !data.password || !data.email_coordinador) {
                return res.status(400).json({ message: 'Falten camps obligatoris.' });
            }

            // 2. Lògica "Altres" -> es_primera_vegada = true
            if (data.nom_centre === 'Altres') {
                data.es_primera_vegada = true;
                if (!data.nom_centre_manual || data.nom_centre_manual.trim() === '') {
                    return res.status(400).json({ message: 'Si seleccioneu "Altres", heu d\'especificar el nom del centre manualment.' });
                }
            } else {
                // Si trien un centre existent, eliminem qualsevol text manual que s'hagi pogut enviar per error
                data.nom_centre_manual = null;
                // Si no es altres, assumim que el centre ja existeix, per tant no es primera vegada en teoria.
                // Pero l'usuari no ha especificat que fer en aquest cas, així que respectem el que vingui o false.
                // Si no ve definit, false.
                if (data.es_primera_vegada === undefined) {
                    data.es_primera_vegada = false;
                }
            }

            // 3. Validar duplicats
            const existingEmail = await SolicitudRegistre.findByEmailCoordinador(data.email_coordinador);
            if (existingEmail) {
                return res.status(400).json({ message: 'Ja existeix una sol·licitud amb aquest email de coordinador.' });
            }

            const existingCodi = await SolicitudRegistre.findByCodiCentre(data.codi_centre);
            if (existingCodi) {
                return res.status(400).json({ message: 'Ja existeix una sol·licitud amb aquest codi de centre.' });
            }

            // 4. Encriptar
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;

            // 5. Crear
            const newId = await SolicitudRegistre.create(data);

            res.status(201).json({
                message: 'Sol·licitud registrada correctament.',
                id: newId,
                es_primera_vegada: data.es_primera_vegada
            });

        } catch (error) {
            console.error('Error al crear sol·licitud:', error);
            res.status(500).json({ message: 'Error en el servidor al processar la sol·licitud.' });
        }
    },

    // ADMIN: GetAll
    getAll: async (req, res) => {
        try {
            const result = await SolicitudRegistre.getAll();
            // Eliminem la contrasenya del llistat
            const sanitizedResult = result.map(item => {
                const { password, ...rest } = item;
                return rest;
            });
            res.json(sanitizedResult);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtenir dades.' });
        }
    },

    // ADMIN: GetById
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await SolicitudRegistre.findById(id);
            if (!item) return res.status(404).json({ message: 'No trobat' });

            // Eliminem la contrasenya
            const { password, ...rest } = item;
            res.json(rest);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtenir dades.' });
        }
    },

    // ADMIN: Update estat (Només es permet modificar l'estat)
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { estat } = req.body;

            if (!estat) {
                return res.status(400).json({ message: 'Cal enviar el nou estat.' });
            }

            const existing = await SolicitudRegistre.findById(id);
            if (!existing) return res.status(404).json({ message: 'No trobat' });

            // Només actualitzem l'estat, la resta es manté igual
            const updatedData = {
                codi_centre: existing.codi_centre,
                nom_centre: existing.nom_centre,
                nom_centre_manual: existing.nom_centre_manual,
                password: existing.password,
                adreca: existing.adreca,
                municipi: existing.municipi,
                telefon: existing.telefon,
                email_centre: existing.email_centre,
                nom_coordinador: existing.nom_coordinador,
                email_coordinador: existing.email_coordinador,
                es_primera_vegada: existing.es_primera_vegada,
                estat: estat // L'únic camp que deixem canviar
            };

            const success = await SolicitudRegistre.update(id, updatedData);

            if (success) {
                // NOTA: Aquí aniria la creació de centre/usuari si estat === 'acceptada'
                res.json({ message: 'Estat actualitzat correctament', data: { estat } });
            } else {
                res.status(400).json({ message: 'Error al actualitzar l\'estat' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    },

    // ADMIN: Delete
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await SolicitudRegistre.delete(id);
            if (success) res.json({ message: 'Eliminat correctament' });
            else res.status(404).json({ message: 'No trobat' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    }
};

module.exports = solicitudRegistreController;
