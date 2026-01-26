// ======================================
// Importem les dependències
// ======================================

const ChecklistConfig = require("../../models/ChecklistConfig");
const Log = require("../../models/Log");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de configuració del checklist (admin): CRUD de passos del checklist

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els passos del checklist ---
const getAllChecklist = async (req, res) => {
  try {
    // 1. Obtenim tots els passos
    const steps = await ChecklistConfig.getAll();

    // 2. Retornem el resultat
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// B) --- Crear un nou pas del checklist ---
const createChecklistStep = async (req, res) => {
  // 1. Obtenim les dades del cos de la petició
  const titol_pas = req.body.titol_pas;
  const obligatori = req.body.obligatori;

  // 2. Validació del camp titol_pas
  if (!titol_pas || typeof titol_pas !== "string" || titol_pas.length > 255) {
    return res.status(400).json({ message: "El camp 'titol_pas' és obligatori, ha de ser text i màxim 255 caràcters." });
  }

  // 3. Validació d'obligatori
  let obligatoriVal = 0;
  if (obligatori === true || obligatori === 1 || obligatori === "1") {
    obligatoriVal = 1;
  }

  try {
    // 4. Creem el pas a la base de dades
    const newId = await ChecklistConfig.create({
      titol_pas: titol_pas,
      obligatori: obligatoriVal
    });

    // 5. Registrem el log d'auditoria
    let usuariIdLog = null;
    if (req.user) {
      usuariIdLog = req.user.id;
    }
    const txtNou = "Creat el pas de checklist '" + (titol_pas || "") + "' (id: " + newId + ", obligatori: " + obligatoriVal + ").";
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "CREATE",
        taula_afectada: "checklist_config",
        valor_anterior: null,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    // 6. Retornem èxit
    res.status(201).json({
      id: newId,
      titol_pas: titol_pas,
      obligatori: obligatoriVal,
      message: "Pas del checklist creat correctament"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// C) --- Actualitzar un pas del checklist ---
const updateChecklistStep = async (req, res) => {
  // 1. Obtenim l'ID i les dades del cos
  const id = req.params.id;
  const titol_pas = req.body.titol_pas;
  const obligatori = req.body.obligatori;

  // 2. Validació del camp titol_pas si ve informat
  if (titol_pas && (typeof titol_pas !== "string" || titol_pas.length > 255)) {
    return res.status(400).json({ message: "El camp 'titol_pas' ha de ser text i màxim 255 caràcters." });
  }

  // 3. Normalitzar obligatori si ve informat
  let obligatoriVal;
  if (obligatori !== undefined) {
    if (obligatori === true || obligatori === 1 || obligatori === "1") {
      obligatoriVal = 1;
    } else {
      obligatoriVal = 0;
    }
  }

  try {
    // 4. Obtenim les dades antigues
    const oldData = await ChecklistConfig.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el pas del checklist." });
    }

    // 5. Construïm l'objecte de dades noves
    let newTitol = "";
    if (titol_pas) {
        newTitol = titol_pas;
    } else {
        newTitol = oldData.titol_pas;
    }

    let newObligatori = 0;
    if (obligatoriVal !== undefined) {
      newObligatori = obligatoriVal;
    } else {
      newObligatori = oldData.obligatori;
    }
    
    const newData = {
      titol_pas: newTitol,
      obligatori: newObligatori
    };

    // 6. Actualitzem a la base de dades
    const updated = await ChecklistConfig.update(id, newData);

    // 7. Registrem el log d'auditoria
    let usuariIdLog = null;
    if (req.user) {
      usuariIdLog = req.user.id;
    }
    const txtAnterior = "Pas de checklist id " + oldData.id + ", títol '" + (oldData.titol_pas || "") + "', obligatori: " + (oldData.obligatori || 0) + ", abans d'actualitzar.";
    const txtNou = "Actualitzat el pas de checklist id " + id + " (títol: '" + (newData.titol_pas || "") + "', obligatori: " + newData.obligatori + ").";
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "UPDATE",
        taula_afectada: "checklist_config",
        valor_anterior: txtAnterior,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    // 8. Retornem èxit
    res.json({ message: "Pas del checklist actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// D) --- Eliminar un pas del checklist ---
const deleteChecklistStep = async (req, res) => {
  // 1. Obtenim l'ID dels paràmetres
  const id = req.params.id;

  try {
    // 2. Obtenim les dades abans d'eliminar
    const oldData = await ChecklistConfig.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat el pas del checklist per eliminar." });
    }

    // 3. Control d'integritat: comprovem si té respostes
    const hasResponses = await ChecklistConfig.hasResponses(id);
    if (hasResponses) {
      return res.status(409).json({
        message: "No es pot eliminar aquest pas perquè ja hi ha centres que l'han respost. Això provocaria pèrdua d'historial. Considera desactivar-lo o arxivar-lo en el futur."
      });
    }

    // 4. Eliminem el pas
    const deleted = await ChecklistConfig.delete(id);

    if (deleted) {
      // 5. Registrem el log d'auditoria
      let usuariIdLog = null;
      if (req.user) {
        usuariIdLog = req.user.id;
      }
      try {
        const txtAnterior = "Pas de checklist id " + oldData.id + ", títol '" + (oldData.titol_pas || "") + "', obligatori: " + (oldData.obligatori || 0) + ", abans d'eliminar.";
        const txtNou = "Eliminat el pas del checklist '" + (oldData.titol_pas || "") + "' (id: " + oldData.id + ").";
        await Log.create({
          usuari_id: usuariIdLog,
          accio: "DELETE",
          taula_afectada: "checklist_config",
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
    }

    // 6. Retornem èxit
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
