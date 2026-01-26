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

// B) --- Obtenir un centre per ID ---
const getCentreById = async (req, res) => {
  try {
    const id = req.params.id;
    const centre = await Centre.findById(id);

    if (!centre) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    // 1. Si té user_id, afegim l'email del coordinador (usuari) per al formulari d'edició
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

// C) --- Crear un nou centre ---
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

  // 1. Normalitzar email del coordinador
  let emailCoord = "";
  if (typeof email_coordinador === "string") {
    emailCoord = email_coordinador.trim().toLowerCase();
  }

  if (!nom_centre || !codi_centre) {
    return res.status(400).json({ message: "El nom del centre i el codi són obligatoris" });
  }

  try {
    // 2. Flux A: email_coordinador i password existents
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
    // 3. Flux B: es proporciona user_id existent
    else {
        if (user_id) {
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
    }

    // 4. Determinem si és primera vegada
    let primeraVegada = 0;
    if (req.body.es_primera_vegada === true || req.body.es_primera_vegada === 1) {
        primeraVegada = 1;
    }

    // 5. Creem el centre
    const newId = await Centre.create({
      codi_centre,
      nom_centre,
      user_id,
      email_oficial: email_oficial || null,
      adreca: adreca || null,
      municipi: municipi || null,
      telefon: telefon || null,
      nom_coordinador: nom_coordinador || null,
      es_primera_vegada: primeraVegada
    });

    // 6. Registrem log
    let usuariIdLog = null;
    if (req.user) {
        usuariIdLog = req.user.id;
    }
    let txtNou = "Creat el centre '" + (nom_centre || "") + "' (codi: " + (codi_centre || "") + ", id: " + newId + ")";
    if (emailCoord) {
        txtNou = txtNou + " i l'usuari del centre (email: " + emailCoord + ").";
    } else {
        txtNou = txtNou + ".";
    }

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

// D) --- Actualitzar un centre existent ---
const updateCentre = async (req, res) => {
  const id = req.params.id;
  const b = req.body;

  try {
    const oldData = await Centre.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    // 1. Si s'envia user_id (assignar altre usuari existent), validar-lo
    if (b.user_id != null) {
      const user = await User.findById(b.user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== "CENTRE") {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    }

    // 2. Actualitzar l'usuari del centre (email i/o password) si el centre té user_id
    if (oldData.user_id) {
      let emailCoordStr = "";
      if (typeof b.email_coordinador === "string") {
        emailCoordStr = b.email_coordinador.trim().toLowerCase();
      }
      const password = b.password;

      if (emailCoordStr) {
        let actualEmail = "";
        const userActual = await User.findById(oldData.user_id);
        if (userActual && userActual.email) {
            actualEmail = userActual.email.toLowerCase();
        }
        
        if (actualEmail !== emailCoordStr) {
          const existent = await User.findByEmail(emailCoordStr);
          if (existent) {
            return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
          }
          await User.update(oldData.user_id, { email: emailCoordStr });
        }
      }

      if (typeof password === "string" && password.length >= 6) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update(oldData.user_id, { password: hashedPassword });
      }
    }

    // 3. Determinar nomFinal
    let nomFinal = "";
    if (b.nom_centre === "Altres" && b.nom_centre_manual) {
        nomFinal = (b.nom_centre_manual || "").trim();
    } else {
        if (b.nom_centre) {
            nomFinal = b.nom_centre;
        } else {
            nomFinal = oldData.nom_centre;
        }
    }

    // 4. Preparar dades d'actualització
    const centreData = {};
    if (b.codi_centre !== undefined) centreData.codi_centre = b.codi_centre;
    else centreData.codi_centre = oldData.codi_centre;

    centreData.nom_centre = nomFinal;
    
    if (b.adreca !== undefined) centreData.adreca = b.adreca;
    else centreData.adreca = oldData.adreca;

    if (b.municipi !== undefined) centreData.municipi = b.municipi;
    else centreData.municipi = oldData.municipi;

    if (b.telefon !== undefined) centreData.telefon = b.telefon;
    else centreData.telefon = oldData.telefon;

    if (b.email_oficial !== undefined) centreData.email_oficial = b.email_oficial;
    else centreData.email_oficial = oldData.email_oficial;

    if (b.nom_coordinador !== undefined) centreData.nom_coordinador = b.nom_coordinador;
    else centreData.nom_coordinador = oldData.nom_coordinador;

    if (b.es_primera_vegada === true || b.es_primera_vegada === 1) {
        centreData.es_primera_vegada = 1;
    } else {
        if (oldData.es_primera_vegada) {
            centreData.es_primera_vegada = 1;
        } else {
            centreData.es_primera_vegada = 0;
        }
    }

    if (b.user_id !== undefined) centreData.user_id = b.user_id;
    else centreData.user_id = oldData.user_id;

    const updated = await Centre.update(id, centreData);
    if (!updated) {
      return res.status(400).json({ message: "No s'han pogut actualitzar les dades." });
    }

    // 5. Registrem log
    let usuariIdLog = null;
    if (req.user) {
        usuariIdLog = req.user.id;
    }
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

// E) --- Eliminar un centre ---
const deleteCentre = async (req, res) => {
  const id = req.params.id;
  let usuariIdLog = null;
  if (req.user) {
      usuariIdLog = req.user.id;
  }

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
    
    const db = require("../../config/db"); 

    const result = await db.query(`
      SELECT aa.comentarios, t.titol as nom_taller, pd.id as taller_detall_id
      FROM assistencia_alumnes aa
      JOIN peticio_detalls pd ON aa.peticio_detall_id = pd.id
      JOIN peticions p ON pd.peticio_id = p.id
      JOIN tallers t ON pd.taller_id = t.id
      WHERE p.centre_id = ? 
      AND aa.comentarios IS NOT NULL 
      AND aa.comentarios != ''
    `, [id]);
    
    const rows = result[0];

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