const ChecklistConfig = require("../../models/ChecklistConfig");
const Log = require("../../models/Log");

// --- 1. GET: Obtenir tots els passos del checklist ---
const getAllChecklist = async (req, res) => {
  try {
    const steps = await ChecklistConfig.getAll();
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. POST: Crear un nou pas ---
const createChecklistStep = async (req, res) => {
  const { titol_pas, obligatori } = req.body;

  // Validació d'Entrada
  if (!titol_pas || typeof titol_pas !== 'string' || titol_pas.length > 255) {
    return res.status(400).json({ message: "El camp 'titol_pas' és obligatori, ha de ser text i màxim 255 caràcters." });
  }

  // Validació d'oblidatori (ha de ser 0 o 1, o true/false convertibles)
  const isObligatory = obligatori === true || obligatori === 1 || obligatori === '1';
  // Si és false/0/undefined entra com a false, però assegurem que enviem 0/1 a la BBDD
  const obligatoriVal = isObligatory ? 1 : 0;

  try {
    const newId = await ChecklistConfig.create({
      titol_pas,
      obligatori: obligatoriVal
    });

    const txtNou = "Creat el pas de checklist '" + (titol_pas || '') + "' (id: " + newId + ", obligatori: " + obligatoriVal + ").";
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null, 
        accio: 'CREATE',
        taula_afectada: 'checklist_config',
        valor_anterior: null,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.status(201).json({ 
      id: newId, 
      titol_pas, 
      obligatori: obligatoriVal,
      message: "Pas del checklist creat correctament" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. PUT: Actualitzar un pas ---
const updateChecklistStep = async (req, res) => {
  const { id } = req.params;
  const { titol_pas, obligatori } = req.body;

  // Validació d'Entrada
  if (titol_pas && (typeof titol_pas !== 'string' || titol_pas.length > 255)) {
    return res.status(400).json({ message: "El camp 'titol_pas' ha de ser text i màxim 255 caràcters." });
  }

  // Normalitzar obligatori si ve informat
  let obligatoriVal;
  if (obligatori !== undefined) {
    obligatoriVal = (obligatori === true || obligatori === 1 || obligatori === '1') ? 1 : 0;
  }

  try {
    const oldData = await ChecklistConfig.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el pas del checklist." });
    }

    const newData = {
      titol_pas: titol_pas || oldData.titol_pas,
      obligatori: obligatoriVal !== undefined ? obligatoriVal : oldData.obligatori
    };

    const updated = await ChecklistConfig.update(id, newData);

    const txtAnterior = "Pas de checklist id " + oldData.id + ", títol '" + (oldData.titol_pas || '') + "', obligatori: " + (oldData.obligatori || 0) + ", abans d'actualitzar.";
    const txtNou = "Actualitzat el pas de checklist id " + id + " (títol: '" + (newData.titol_pas || oldData.titol_pas || '') + "', obligatori: " + (newData.obligatori !== undefined ? newData.obligatori : oldData.obligatori) + ").";
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null, 
        accio: 'UPDATE',
        taula_afectada: 'checklist_config',
        valor_anterior: txtAnterior,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.json({ message: "Pas del checklist actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 4. DELETE: Eliminar un pas ---
const deleteChecklistStep = async (req, res) => {
  const { id } = req.params;

  try {
    const oldData = await ChecklistConfig.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el pas del checklist per eliminar." });
    }

    // Control d'Integritat: Comprovar si té respostes
    const hasResponses = await ChecklistConfig.hasResponses(id);
    if (hasResponses) {
      return res.status(409).json({ 
        message: "No es pot eliminar aquest pas perquè ja hi ha centres que l'han respost. Això provocaria pèrdua d'historial. Considera desactivar-lo o arxivar-lo en el futur." 
      });
    }

    const deleted = await ChecklistConfig.delete(id);

    if (deleted) {
      try {
        const txtAnterior = "Pas de checklist id " + oldData.id + ", títol '" + (oldData.titol_pas || '') + "', obligatori: " + (oldData.obligatori || 0) + ", abans d'eliminar.";
        const txtNou = "Eliminat el pas del checklist '" + (oldData.titol_pas || '') + "' (id: " + oldData.id + ").";
        await Log.create({
          usuari_id: req.user ? req.user.id : null, 
          accio: 'DELETE',
          taula_afectada: 'checklist_config',
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
    }

    res.json({ message: "Pas del checklist eliminat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllChecklist,
  createChecklistStep,
  updateChecklistStep,
  deleteChecklistStep
};
