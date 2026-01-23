const SolicitudRegistre = require('../models/SolicitudRegistre');
const User = require('../models/User');
const Centre = require('../models/Centre');
const Log = require('../models/Log');
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


            // 3.1 Comprovar Email del Coordinador (Login)
            const requestWithEmail = await SolicitudRegistre.findByEmailCoordinador(data.email_coordinador);
            const userWithEmail = await User.findByEmail(data.email_coordinador);

            if (requestWithEmail || userWithEmail) {
                return res.status(400).json({ message: 'Aquest email de coordinador ja està en ús o té una sol·licitud activa.' });
            }

            // 3.2 Comprovar Codi de Centre (Identificador oficial)
            const requestWithCodi = await SolicitudRegistre.findByCodiCentre(data.codi_centre);
            // Cal buscar també a la taula 'centres'. Com que no tenim un findByCodiCentre al model Centre, ho fem manual o usem getAll.
            const [existingCentres] = await require('../config/db').query("SELECT id FROM centres WHERE codi_centre = ?", [data.codi_centre]);

            if (requestWithCodi || existingCentres.length > 0) {
                return res.status(400).json({ message: 'Aquest codi de centre ja està registrat o té una sol·licitud activa.' });
            }

            // 3.3 Comprovar Email del Centre (Oficial)
            const requestWithEmailCentre = await SolicitudRegistre.findByEmailCentre(data.email_centre);
            const [existingEmailsOficials] = await require('../config/db').query("SELECT id FROM centres WHERE email_oficial = ?", [data.email_centre]);

            if (requestWithEmailCentre || existingEmailsOficials.length > 0) {
                return res.status(400).json({ message: 'Aquest email de centre ja està registrat o té una sol·licitud activa.' });
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
                // Si l'estat passa a 'acceptada', creem l'usuari i el centre
                if (estat === 'acceptada' && existing.estat !== 'acceptada') {
                    try {
                        // 1. Crear l'usuari per al coordinador
                        // Nota: La contrasenya ja està hashejada a la taula solicituds_registre
                        const userId = await User.create({
                            email: existing.email_coordinador,
                            password: existing.password,
                            rol: 'CENTRE'
                        });

                        // 2. Crear el centre vinculat a l'usuari
                        // Si era "Altres", usem el nom manual. Si no, el de l'enum.
                        const nomCentreFinal = existing.nom_centre === 'Altres' ? existing.nom_centre_manual : existing.nom_centre;

                        await Centre.create({
                            codi_centre: existing.codi_centre,
                            nom_centre: nomCentreFinal,
                            adreca: existing.adreca,
                            municipi: existing.municipi,
                            telefon: existing.telefon,
                            email_oficial: existing.email_centre,
                            nom_coordinador: existing.nom_coordinador,
                            es_primera_vegada: existing.es_primera_vegada,
                            user_id: userId
                        });
                    } catch (err) {
                        console.error('Error al crear usuari o centre tras acceptar sol·licitud:', err);
                        return res.status(500).json({ message: 'Sol·licitud marcada com acceptada però error al crear entitats.', error: err.message });
                    }
                }

                // Log d'auditoria quan l'administrador accepta o rebutja la sol·licitud
                if (estat === 'acceptada' || estat === 'rebutjada') {
                    const accio = estat === 'acceptada' ? 'ACCEPT_REGISTRATION' : 'REJECT_REGISTRATION';
                    const nomC = existing.nom_centre === 'Altres' ? (existing.nom_centre_manual || 'Altres') : (existing.nom_centre || '');
                    const txtAnterior = "Sol·licitud de registre id " + existing.id + ", estat '" + (existing.estat || '') + "', centre '" + nomC + "' (codi: " + (existing.codi_centre || '') + "), email coordinador: " + (existing.email_coordinador || '') + ".";
                    let txtNou;
                    if (estat === 'acceptada') {
                        txtNou = "Acceptada la sol·licitud de registre del centre '" + nomC + "' (id: " + existing.id + ").";
                    } else {
                        txtNou = "Rebutjada la sol·licitud de registre del centre '" + nomC + "' (id: " + existing.id + ").";
                    }
                    try {
                        await Log.create({
                            usuari_id: req.user ? req.user.id : null,
                            accio: accio,
                            taula_afectada: 'solicituds_registre',
                            valor_anterior: txtAnterior,
                            valor_nou: txtNou
                        });
                    } catch (logErr) {
                        console.error("Error creant log d'auditoria:", logErr.message);
                    }
                }

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
            const id = req.params.id;

            // 1. Obtenir les dades abans de borrar per al log
            const item = await SolicitudRegistre.findById(id);
            if (!item) return res.status(404).json({ message: 'No trobat' });

            const success = await SolicitudRegistre.delete(id);
            if (success) {
                // 2. Log d'auditoria (només si l'eliminació ha tingut èxit); sense password
                const nomC = item.nom_centre === 'Altres' ? (item.nom_centre_manual || 'Altres') : (item.nom_centre || '');
                const txtAnterior = "Sol·licitud de registre id " + item.id + ", estat '" + (item.estat || '') + "', centre '" + nomC + "' (codi: " + (item.codi_centre || '') + "), email coordinador: " + (item.email_coordinador || '') + ", abans d'eliminar.";
                const txtNou = "Eliminada la sol·licitud de registre del centre '" + nomC + "' (id: " + item.id + ").";
                try {
                    await Log.create({
                        usuari_id: req.user ? req.user.id : null,
                        accio: 'DELETE_REGISTRATION',
                        taula_afectada: 'solicituds_registre',
                        valor_anterior: txtAnterior,
                        valor_nou: txtNou
                    });
                } catch (logErr) {
                    console.error("Error creant log d'auditoria:", logErr.message);
                }
                res.json({ message: 'Eliminat correctament' });
            } else {
                res.status(404).json({ message: 'No trobat' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al servidor' });
        }
    }
};

module.exports = solicitudRegistreController;
