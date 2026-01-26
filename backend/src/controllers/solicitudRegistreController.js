// ======================================
// Importem les dependències
// ======================================

const SolicitudRegistre = require("../models/SolicitudRegistre");
const User = require("../models/User");
const Centre = require("../models/Centre");
const Log = require("../models/Log");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de sol·licituds de registre: crear, llistar, actualitzar estat i eliminar

// ======================================
// Declaracions de funcions
// ======================================

const solicitudRegistreController = {
  // A) --- Crear una nova sol·licitud (públic) ---
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
                // Si no ve definit, false.
                if (data.es_primera_vegada === undefined) {
                    data.es_primera_vegada = false;
                }
            }


            // 3. Comprovar Email del Coordinador (Login)
            const requestWithEmail = await SolicitudRegistre.findByEmailCoordinador(data.email_coordinador);
            const userWithEmail = await User.findByEmail(data.email_coordinador);

            if (requestWithEmail || userWithEmail) {
                return res.status(400).json({ message: 'Aquest email de coordinador ja està en ús o té una sol·licitud activa.' });
            }

            // 4. Comprovar Codi de Centre (Identificador oficial)
            const requestWithCodi = await SolicitudRegistre.findByCodiCentre(data.codi_centre);
            const resCentres = await db.query("SELECT id FROM centres WHERE codi_centre = ?", [data.codi_centre]);
            const existingCentres = resCentres[0];

            if (requestWithCodi || existingCentres.length > 0) {
                return res.status(400).json({ message: 'Aquest codi de centre ja està registrat o té una sol·licitud activa.' });
            }

            // 5. Comprovar Email del Centre (Oficial)
            const requestWithEmailCentre = await SolicitudRegistre.findByEmailCentre(data.email_centre);
            const resEmails = await db.query("SELECT id FROM centres WHERE email_oficial = ?", [data.email_centre]);
            const existingEmailsOficials = resEmails[0];

            if (requestWithEmailCentre || existingEmailsOficials.length > 0) {
                return res.status(400).json({ message: 'Aquest email de centre ja està registrat o té una sol·licitud activa.' });
            }

            // 6. Encriptar
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;

            // 7. Crear
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

  // B) --- Obtenir totes les sol·licituds (admin, sense contrasenya) ---
  getAll: async (req, res) => {
    try {
      const result = await SolicitudRegistre.getAll();
      
      // 1. Eliminem la contrasenya del llistat amb un bucle
      const sanitizedResult = [];
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        const rest = {};
        // Copiem manualment les propietats excepte password
        // (Podem usar bucle for-in ja que és un objecte pla de BD)
        for (const k in item) {
          if (k !== "password") {
            rest[k] = item[k];
          }
        }
        sanitizedResult.push(rest);
      }
      
      res.json(sanitizedResult);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtenir dades." });
    }
  },

  // C) --- Obtenir una sol·licitud per ID (admin, sense contrasenya) ---
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await SolicitudRegistre.findById(id);
      if (!item) {
        return res.status(404).json({ message: "No trobat" });
      }

      // 1. Eliminem la contrasenya construint un objecte sense aquest camp
      const rest = {};
      for (const k in item) {
        if (k !== "password") {
          rest[k] = item[k];
        }
      }
      res.json(rest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtenir dades." });
    }
  },

  // D) --- Actualitzar l'estat d'una sol·licitud (admin) ---
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const estat = req.body.estat;

      // 1. Validem l'estat
      if (!estat) {
        return res.status(400).json({ message: "Cal enviar el nou estat." });
      }

      // 2. Busquem la sol·licitud existent
      const existing = await SolicitudRegistre.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "No trobat" });
      }

      // 3. Només actualitzem l'estat, la resta es manté igual
      const updatedData = {};
      updatedData.codi_centre = existing.codi_centre;
      updatedData.nom_centre = existing.nom_centre;
      updatedData.nom_centre_manual = existing.nom_centre_manual;
      updatedData.password = existing.password;
      updatedData.adreca = existing.adreca;
      updatedData.municipi = existing.municipi;
      updatedData.telefon = existing.telefon;
      updatedData.email_centre = existing.email_centre;
      updatedData.nom_coordinador = existing.nom_coordinador;
      updatedData.email_coordinador = existing.email_coordinador;
      updatedData.es_primera_vegada = existing.es_primera_vegada;
      updatedData.estat = estat; // L'únic camp que deixem canviar

      // 4. Executem l'actualització
      const success = await SolicitudRegistre.update(id, updatedData);

      if (success) {
          // 5. Si l'estat passa a 'acceptada', creem l'usuari i el centre
          if (estat === 'acceptada') {
              if (existing.estat !== 'acceptada') {
                try {
                    // 5.1 Crear l'usuari per al coordinador
                    // Nota: La contrasenya ja està hashejada a la taula solicituds_registre
                    const userId = await User.create({
                        email: existing.email_coordinador,
                        password: existing.password,
                        rol: 'CENTRE'
                    });

                    // 5.2 Crear el centre vinculat a l'usuari
                    let nomCentreFinal;
                    if (existing.nom_centre === "Altres") {
                        nomCentreFinal = existing.nom_centre_manual;
                    } else {
                        nomCentreFinal = existing.nom_centre;
                    }

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
          }

          // 6. Log d'auditoria quan l'administrador accepta o rebutja la sol·licitud
          if (estat === "acceptada" || estat === "rebutjada") {
            let accio;
            if (estat === "acceptada") {
              accio = "ACCEPT_REGISTRATION";
            } else {
              accio = "REJECT_REGISTRATION";
            }
            
            let nomC;
            if (existing.nom_centre === "Altres") {
              if (existing.nom_centre_manual) {
                  nomC = existing.nom_centre_manual;
              } else {
                  nomC = "Altres";
              }
            } else {
              if (existing.nom_centre) {
                  nomC = existing.nom_centre;
              } else {
                  nomC = "";
              }
            }
            
            let txtAnterior = "Sol·licitud de registre id " + existing.id + ", estat '";
            if (existing.estat) txtAnterior += existing.estat;
            txtAnterior += "', centre '" + nomC + "' (codi: ";
            if (existing.codi_centre) txtAnterior += existing.codi_centre;
            txtAnterior += "), email coordinador: ";
            if (existing.email_coordinador) txtAnterior += existing.email_coordinador;
            txtAnterior += ".";

            let txtNou;
            if (estat === "acceptada") {
              txtNou = "Acceptada la sol·licitud de registre del centre '" + nomC + "' (id: " + existing.id + ").";
            } else {
              txtNou = "Rebutjada la sol·licitud de registre del centre '" + nomC + "' (id: " + existing.id + ").";
            }
            
            let usuariIdLog = null;
            if (req.user) {
              usuariIdLog = req.user.id;
            }
            try {
              await Log.create({
                usuari_id: usuariIdLog,
                accio: accio,
                taula_afectada: "solicituds_registre",
                valor_anterior: txtAnterior,
                valor_nou: txtNou
              });
            } catch (logErr) {
              console.error("Error creant log d'auditoria:", logErr.message);
            }
          }

          const responseData = {};
          responseData.estat = estat;
          res.json({ message: "Estat actualitzat correctament", data: responseData });
      } else {
          res.status(400).json({ message: "Error al actualitzar l'estat" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al servidor" });
    }
  },

  // E) --- Eliminar una sol·licitud (admin) ---
  delete: async (req, res) => {
    try {
      const id = req.params.id;

      const item = await SolicitudRegistre.findById(id);
      if (!item) {
        return res.status(404).json({ message: "No trobat" });
      }

      const success = await SolicitudRegistre.delete(id);
      if (success) {
        let nomC;
        if (item.nom_centre === "Altres") {
          if (item.nom_centre_manual) {
              nomC = item.nom_centre_manual;
          } else {
              nomC = "Altres";
          }
        } else {
          if (item.nom_centre) {
              nomC = item.nom_centre;
          } else {
              nomC = "";
          }
        }
        
        let txtAnterior = "Sol·licitud de registre id " + item.id + ", estat '";
        if (item.estat) txtAnterior += item.estat;
        txtAnterior += "', centre '" + nomC + "' (codi: ";
        if (item.codi_centre) txtAnterior += item.codi_centre;
        txtAnterior += "), email coordinador: ";
        if (item.email_coordinador) txtAnterior += item.email_coordinador;
        txtAnterior += ", abans d'eliminar.";
        
        const txtNou = "Eliminada la sol·licitud de registre del centre '" + nomC + "' (id: " + item.id + ").";
        
        let usuariIdLog = null;
        if (req.user) {
          usuariIdLog = req.user.id;
        }
        
        try {
          await Log.create({
            usuari_id: usuariIdLog,
            accio: "DELETE_REGISTRATION",
            taula_afectada: "solicituds_registre",
            valor_anterior: txtAnterior,
            valor_nou: txtNou
          });
        } catch (logErr) {
          console.error("Error creant log d'auditoria:", logErr.message);
        }
        res.json({ message: "Eliminat correctament" });
      } else {
        res.status(404).json({ message: "No trobat" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al servidor" });
    }
  }
};

module.exports = solicitudRegistreController;
