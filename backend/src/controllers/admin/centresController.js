// ======================================
// Importem les dependències
// ======================================

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

// B) --- Obtenir un centre per ID (per al detall) ---
const getCentreById = async (req, res) => {
  try {
    // 1. Obtenim l'ID dels paràmetres de la ruta
    const id = req.params.id;

    // 2. Busquem el centre
    const centre = await Centre.findById(id);

    if (!centre) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    res.json(centre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// C) --- Crear un nou centre ---
const createCentre = async (req, res) => {
  // 1. Obtenim les dades del cos de la petició
  const codi_centre = req.body.codi_centre;
  const nom_centre = req.body.nom_centre;
  const user_id = req.body.user_id;
  const email_oficial = req.body.email_oficial;
  const adreca = req.body.adreca;
  const municipi = req.body.municipi;
  const telefon = req.body.telefon;
  const nom_coordinador = req.body.nom_coordinador;
  const es_primera_vegada = req.body.es_primera_vegada;

  if (!nom_centre || !codi_centre) {
    return res.status(400).json({ message: "El nom del centre i el codi són obligatoris" });
  }

  try {
    // 2. Si s'assigna usuari, comprovem que existeixi i tingui rol CENTRE
    if (user_id) {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== "CENTRE") {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    }

    // 3. Creem el centre a la base de dades
    const newId = await Centre.create({
      codi_centre: codi_centre,
      nom_centre: nom_centre,
      user_id: user_id,
      email_oficial: email_oficial,
      adreca: adreca,
      municipi: municipi,
      telefon: telefon,
      nom_coordinador: nom_coordinador,
      es_primera_vegada: es_primera_vegada
    });

    // 4. Registrem el log d'auditoria
    let usuariIdLog = null;
    if (req.user) {
      usuariIdLog = req.user.id;
    }
    const txtNou = "Creat el centre '" + (nom_centre || "") + "' (codi: " + (codi_centre || "") + ", id: " + newId + ").";
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

    // 5. Retornem èxit
    res.status(201).json({
      id: newId,
      nom_centre: nom_centre,
      message: "Centre creat correctament"
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Ja existeix un centre amb aquest codi o nom." });
    }
    res.status(500).json({ error: error.message });
  }
};

// D) --- Actualitzar un centre existent ---
const updateCentre = async (req, res) => {
  // 1. Obtenim l'ID i les dades noves
  const id = req.params.id;
  const newData = req.body;

  try {
    // 2. Si s'assigna usuari, comprovem que existeixi i tingui rol CENTRE
    if (newData.user_id) {
      const user = await User.findById(newData.user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== "CENTRE") {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    }

    // 3. Obtenim les dades antigues i actualitzem
    const oldData = await Centre.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    const updated = await Centre.update(id, newData);

    if (!updated) {
      return res.status(400).json({ message: "No s'han pogut actualitzar les dades." });
    }

    // 4. Registrem el log d'auditoria
    let usuariIdLog = null;
    if (req.user) {
      usuariIdLog = req.user.id;
    }
    const txtAnterior = "Centre id " + oldData.id + ", nom '" + (oldData.nom_centre || "") + "', codi " + (oldData.codi_centre || "") + ", abans d'actualitzar.";
    const txtNou = "Actualitzat el centre id " + id + " (nom: '" + (newData.nom_centre || oldData.nom_centre || "") + "', codi: " + (newData.codi_centre || oldData.codi_centre || "") + ").";
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

    // 5. Retornem èxit
    res.json({ message: "Centre actualitzat correctament" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Ja existeix un centre amb aquest codi o nom." });
    }
    res.status(500).json({ error: error.message });
  }
};

// E) --- Eliminar un centre ---
const deleteCentre = async (req, res) => {
  // 1. Obtenim l'ID dels paràmetres
  const id = req.params.id;

  try {
    // 2. Obtenim les dades abans d'eliminar
    const oldData = await Centre.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el centre per eliminar" });
    }

    // 3. Eliminem el centre
    const deleted = await Centre.delete(id);

    if (deleted) {
      // 4. Registrem el log d'auditoria
      let usuariIdLog = null;
      if (req.user) {
        usuariIdLog = req.user.id;
      }
      try {
        const txtAnterior = "Centre amb id " + oldData.id + ", nom '" + (oldData.nom_centre || "") + "', codi " + (oldData.codi_centre || "") + ", abans d'eliminar.";
        const txtNou = "Eliminat el centre '" + (oldData.nom_centre || "") + "' (codi: " + (oldData.codi_centre || "") + ", id: " + oldData.id + ").";
        await Log.create({
          usuari_id: usuariIdLog,
          accio: "DELETE",
          taula_afectada: "centres",
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
    }

    // 5. Retornem èxit
    res.json({ message: "Centre eliminat correctament" });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
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