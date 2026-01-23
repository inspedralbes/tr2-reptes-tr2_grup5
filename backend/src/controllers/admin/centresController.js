const Centre = require("../../models/Centre");
const Log = require("../../models/Log");
const User = require("../../models/User");

// --- 1. GET: Obtenir tots els centres ---
const getAllCentres = async (req, res) => {
  try {
    const centres = await Centre.getAll();
    res.json(centres || []); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- NOU: GET: Obtenir un centre per ID (Per al detall) ---
const getCentreById = async (req, res) => {
  try {
    const { id } = req.params;
    const centre = await Centre.findById(id);

    if (!centre) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    res.json(centre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. POST: Crear un nou centre ---
const createCentre = async (req, res) => {
  const { 
    codi_centre,
    nom_centre, 
    user_id, 
    email_oficial, 
    adreca,
    municipi, 
    telefon,
    nom_coordinador,
    es_primera_vegada 
  } = req.body;

  if (!nom_centre || !codi_centre) {
    return res.status(400).json({ message: "El nom del centre i el codi són obligatoris" });
  }

  try {
    if (user_id) {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== 'CENTRE') {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    }

    const newId = await Centre.create({
      codi_centre,
      nom_centre, 
      user_id, 
      email_oficial, 
      adreca,
      municipi, 
      telefon,
      nom_coordinador,
      es_primera_vegada
    });

    const txtNou = "Creat el centre '" + (nom_centre || '') + "' (codi: " + (codi_centre || '') + ", id: " + newId + ").";
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null,
        accio: 'CREATE',
        taula_afectada: 'centres',
        valor_anterior: null,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.status(201).json({ 
      id: newId, 
      nom_centre, 
      message: "Centre creat correctament" 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Ja existeix un centre amb aquest codi o nom." });
    }
    res.status(500).json({ error: error.message });
  }
};

// --- 3. PUT: Actualitzar un centre existent ---
const updateCentre = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  try {
    if (newData.user_id) {
      const user = await User.findById(newData.user_id);
      if (!user) {
        return res.status(404).json({ message: "L'usuari assignat no existeix." });
      }
      if (user.rol !== 'CENTRE') {
        return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
      }
    }

    const oldData = await Centre.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el centre" });
    }

    const updated = await Centre.update(id, newData);

    if (!updated) {
      return res.status(400).json({ message: "No s'han pogut actualitzar les dades." });
    }

    const txtAnterior = "Centre id " + oldData.id + ", nom '" + (oldData.nom_centre || '') + "', codi " + (oldData.codi_centre || '') + ", abans d'actualitzar.";
    const txtNou = "Actualitzat el centre id " + id + " (nom: '" + (newData.nom_centre || oldData.nom_centre || '') + "', codi: " + (newData.codi_centre || oldData.codi_centre || '') + ").";
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null, 
        accio: 'UPDATE',
        taula_afectada: 'centres',
        valor_anterior: txtAnterior,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.json({ message: "Centre actualitzat correctament" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Ja existeix un centre amb aquest codi o nom." });
    }
    res.status(500).json({ error: error.message });
  }
};

// --- 4. DELETE: Eliminar un centre ---
const deleteCentre = async (req, res) => {
  const { id } = req.params;
  try {
    const oldData = await Centre.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el centre per eliminar" });
    }

    const deleted = await Centre.delete(id);

    if (deleted) {
      try {
        const txtAnterior = "Centre amb id " + oldData.id + ", nom '" + (oldData.nom_centre || "") + "', codi " + (oldData.codi_centre || "") + ", abans d'eliminar.";
        const txtNou = "Eliminat el centre '" + (oldData.nom_centre || "") + "' (codi: " + (oldData.codi_centre || "") + ", id: " + oldData.id + ").";
        await Log.create({
          usuari_id: req.user ? req.user.id : null, 
          accio: 'DELETE',
          taula_afectada: 'centres',
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
    }

    res.json({ message: "Centre eliminat correctament" });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: "No es pot eliminar el centre perquè té registres associats (peticions, etc.)." });
    }
    res.status(500).json({ error: error.message });
  }
};

// --- EXPORTS ACTUALITZATS ---
module.exports = { 
  getAllCentres,
  getCentreById, // Afegeix-lo aquí
  createCentre, 
  updateCentre, 
  deleteCentre 
};