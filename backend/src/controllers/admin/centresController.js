const Centre = require("../../models/Centre");
const Log = require("../../models/Log");
const User = require("../../models/User");

// --- 1. GET: Obtenir tots els centres ---
const getAllCentres = async (req, res) => {
  try {
    const centres = await Centre.getAll();
    res.json(centres);
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

  // Comprovem camps obligatoris
  if (!nom_centre || !codi_centre) {
    return res.status(400).json({ message: "El nom del centre i el codi són obligatoris" });
  }

  // Validació de Rol: Si s'assigna un usuari, ha de ser rol 'CENTRE'
  if (user_id) {
    // Nota: El mètode hasRole retorna true/false, però la consulta SQL potser retorna rows buides.
    // Millor fem una consulta directa a User.findById per estar segurs del rol.
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "L'usuari assignat no existeix." });
    }
    if (user.rol !== 'CENTRE') {
      return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
    }
  }

  try {
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
    
    // AUDITORIA
    await Log.create({
      usuari_id: req.user ? req.user.id : null, // Assumint que tenim el middleware auth
      accio: 'CREATE',
      taula_afectada: 'centres',
      valor_nou: { id: newId, codi_centre, nom_centre }
    });

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

  // Validació de Rol en cas de canvi d'usuari
  if (newData.user_id) {
    const user = await User.findById(newData.user_id);
    if (!user) {
      return res.status(404).json({ message: "L'usuari assignat no existeix." });
    }
    if (user.rol !== 'CENTRE') {
      return res.status(400).json({ message: "L'usuari assignat ha de tenir el rol 'CENTRE'." });
    }
  }

  try {
    // Recuperar valor anterior per auditoria
    const oldData = await Centre.findById(id);

    const updated = await Centre.update(id, newData);

    if (!updated) {
      return res.status(404).json({ message: "No s'ha trobat el centre per actualitzar" });
    }

    // AUDITORIA
    await Log.create({
      usuari_id: req.user ? req.user.id : null, 
      accio: 'UPDATE',
      taula_afectada: 'centres',
      valor_anterior: oldData,
      valor_nou: { id, ...newData }
    });

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
    // Recuperar valor anterior per auditoria
    const oldData = await Centre.findById(id);

    const deleted = await Centre.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "No s'ha trobat el centre per eliminar" });
    }

    // AUDITORIA
    await Log.create({
      usuari_id: req.user ? req.user.id : null, 
      accio: 'DELETE',
      taula_afectada: 'centres',
      valor_anterior: oldData
    });

    res.json({ message: "Centre eliminat correctament" });
  } catch (error) {
    // Si falla per restricció de clau forana
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: "No es pot eliminar el centre perquè té registres associades." });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getAllCentres,  
  createCentre, 
  updateCentre, 
  deleteCentre 
};

