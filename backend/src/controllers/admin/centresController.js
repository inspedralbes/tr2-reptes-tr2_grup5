// ======================================
// Importem les dependències
// ======================================

const bcrypt = require("bcryptjs");
const Centre = require("../../models/Centre");
const Log = require("../../models/Log");
const User = require("../../models/User");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de centres (admin): CRUD de centres

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els centres ---
const getAllCentres = async (req, res) => {
  try {
    // 1. Obtenim tots els centres
    const centres = await Centre.getAll();

    // 2. Si no n'hi ha, retornem array buit; si n'hi ha, els retornem
    let resultat = centres;
    if (!resultat) {
      resultat = [];
    }

    res.json(resultat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// B) --- Obtenir un centre per ID (per al detall i per al formulari d'edició) ---
const getCentreById = async (req, res) => {
  try {
    const id = req.params.id;
    const centre = await Centre.findById(id);

    if (!centre) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    // Si té user_id, afegim l'email del coordinador (usuari) per al formulari d'edició
    if (centre.user_id) {
      const user = await User.findById(centre.user_id);
      if (user) {
        centre.email_coordinador = user.email;
      }
    }

    res.json(centre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// C) --- Crear un nou centre (i opcionalment l'usuari del centre amb email_coordinador + password) ---
const createCentre = async (req, res) => {
  const codi_centre = req.body.codi_centre;
  const nom_centre = req.body.nom_centre;
  let user_id = req.body.user_id;
  const email_coordinador = req.body.email_coordinador;
  const password = req.body.password;
  const email_oficial = req.body.email_oficial;
  const adreca = req.body.adreca;
  const municipi = req.body.municipi;
  const telefon = req.body.telefon;
  const nom_coordinador = req.body.nom_coordinador;

  // Normalitzar email del coordinador (trim + minúscules) per a Flux A
  const emailCoord = (typeof email_coordinador === "string" ? email_coordinador : "").trim().toLowerCase();

  if (!nom_centre || !codi_centre) {
    return res.status(400).json({ message: "El nom del centre i el codi són obligatoris" });
  }

  try {
    // Flux A: email_coordinador i password -> crear usuari CENTRE (email, contrasenya, rol) i després el centre (amb user_id i nom_coordinador)
    if (emailCoord && password) {
      const existent = await User.findByEmail(emailCoord);
      if (existent) {
        return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
      }
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "La contrasenya ha de tenir almenys 6 caràcters." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user_id = await User.create({
        email: emailCoord,
        password: hashedPassword,
        rol: "CENTRE"
      });
    }
    // Flux B: es proporciona user_id existent -> només crear el centre
    else if (user_id) {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== "CENTRE") {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    } else {
      return res.status(400).json({ message: "Cal l'email del coordinador i la contrasenya per crear l'usuari del centre." });
    }

    const newId = await Centre.create({
      codi_centre,
      nom_centre,
      user_id,
      email_oficial: email_oficial || null,
      adreca: adreca || null,
      municipi: municipi || null,
      telefon: telefon || null,
      nom_coordinador: nom_coordinador || null,
      es_primera_vegada: (req.body.es_primera_vegada === true || req.body.es_primera_vegada === 1) ? 1 : 0
    });

    let usuariIdLog = req.user ? req.user.id : null;
    const txtNou = "Creat el centre '" + (nom_centre || "") + "' (codi: " + (codi_centre || "") + ", id: " + newId + ")" + (emailCoord ? " i l'usuari del centre (email: " + emailCoord + ")." : ".");
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "CREATE",
        taula_afectada: "centres",
        valor_anterior: null,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.status(201).json({
      id: newId,
      nom_centre: nom_centre,
      message: "Centre creat correctament"
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ja existeix un centre amb aquest codi o nom." });
    }
    res.status(500).json({ error: error.message });
  }
};

// D) --- Actualitzar un centre existent (i opcionalment l'email/password de l'usuari del centre) ---
const updateCentre = async (req, res) => {
  const id = req.params.id;
  const b = req.body;

  try {
    const oldData = await Centre.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    // Si s'envia user_id (assignar altre usuari existent), validar-lo
    if (b.user_id != null) {
      const user = await User.findById(b.user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== "CENTRE") {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    }

    // Actualitzar l'usuari del centre (email i/o password) si el centre té user_id
    if (oldData.user_id) {
      const emailCoord = (typeof b.email_coordinador === "string" ? b.email_coordinador : "").trim().toLowerCase();
      const password = b.password;

      if (emailCoord) {
        const userActual = await User.findById(oldData.user_id);
        if (userActual && (userActual.email || "").toLowerCase() !== emailCoord) {
          const existent = await User.findByEmail(emailCoord);
          if (existent) {
            return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
          }
          await User.update(oldData.user_id, { email: emailCoord });
        }
      }

      if (typeof password === "string" && password.length >= 6) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update(oldData.user_id, { password: hashedPassword });
      }
    }

    // Construir dades per a Centre.update
    const nomFinal = (b.nom_centre === "Altres" && b.nom_centre_manual) ? (b.nom_centre_manual || "").trim() : (b.nom_centre ?? oldData.nom_centre);
    const centreData = {
      codi_centre: b.codi_centre ?? oldData.codi_centre,
      nom_centre: nomFinal || oldData.nom_centre,
      adreca: b.adreca !== undefined ? b.adreca : oldData.adreca,
      municipi: b.municipi !== undefined ? b.municipi : oldData.municipi,
      telefon: b.telefon !== undefined ? b.telefon : oldData.telefon,
      email_oficial: b.email_oficial !== undefined ? b.email_oficial : oldData.email_oficial,
      nom_coordinador: b.nom_coordinador !== undefined ? b.nom_coordinador : oldData.nom_coordinador,
      es_primera_vegada: (b.es_primera_vegada === true || b.es_primera_vegada === 1) ? 1 : (oldData.es_primera_vegada ? 1 : 0),
      user_id: b.user_id !== undefined ? b.user_id : oldData.user_id
    };

    const updated = await Centre.update(id, centreData);
    if (!updated) {
      return res.status(400).json({ message: "No s'han pogut actualitzar les dades." });
    }

    let usuariIdLog = req.user ? req.user.id : null;
    const txtAnterior = "Centre id " + oldData.id + ", nom '" + (oldData.nom_centre || "") + "', codi " + (oldData.codi_centre || "") + ", abans d'actualitzar.";
    const txtNou = "Actualitzat el centre id " + id + " (nom: '" + (centreData.nom_centre || "") + "', codi: " + (centreData.codi_centre || "") + ").";
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "UPDATE",
        taula_afectada: "centres",
        valor_anterior: txtAnterior,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.json({ message: "Centre actualitzat correctament" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ja existeix un centre amb aquest codi o nom." });
    }
    res.status(500).json({ error: error.message });
  }
};

// E) --- Eliminar un centre (usuari del centre, professors i usuaris, peticions, etc. i log) ---
const deleteCentre = async (req, res) => {
  const id = req.params.id;
  const usuariIdLog = req.user ? req.user.id : null;

  try {
    const result = await User.deleteCentre(id, usuariIdLog);
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    res.json({ message: "Centre eliminat correctament" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ message: "No es pot eliminar el centre perquè té registres associats (peticions, etc.)." });
    }
    res.status(500).json({ error: error.message });
  }
}


// F) --- Obtenir comentaris (reputació) ---
const getCentreComments = async (req, res) => {
  try {
    const id = req.params.id;
    // Join: Centres -> Peticions -> PeticioDetalls -> AssistenciaAlumnes
    // We want all 'comentarios' from 'assistencia_alumnes' linked to this centre
    // Note: This requires a direct DB query typically, unless models support deep nested joins differently.
    // Using raw query for simplicity as models seem simple.
    const db = require("../../config/db"); // Ensure we have db access

    const [rows] = await db.query(`
      SELECT aa.comentarios, t.titol as nom_taller, pd.id as taller_detall_id
      FROM assistencia_alumnes aa
      JOIN peticio_detalls pd ON aa.peticio_detall_id = pd.id
      JOIN peticions p ON pd.peticio_id = p.id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ? 
      AND aa.comentarios IS NOT NULL 
      AND aa.comentarios != ''
    `, [id]);

    // Retorna array d'objectes { comentarios, nom_taller, taller_detall_id }
    res.json(rows);

  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCentres,
  getCentreById,
  createCentre,
  updateCentre,
  deleteCentre,
  getCentreComments
};