const Enquesta = require("../../models/Enquesta");
const Pregunta = require("../../models/Pregunta");
const Log = require("../../models/Log");

const DESTINATARIS_VALID = ['ALUMNE', 'PROFESSOR', 'CENTRE'];
const TIPUS_PREGUNTA_VALID = ['LIKERT_1_10', 'MULTIPLE', 'OBERTA'];

// --- ENQUESTES ---

const getAllEnquestes = async (req, res) => {
  try {
    const enquestes = await Enquesta.getAll();
    res.json(enquestes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEnquesta = async (req, res) => {
  const { titol, destinatari } = req.body;

  if (!titol || !destinatari) {
    return res.status(400).json({ message: "Títol i destinatari són obligatoris." });
  }

  // Validació de Destinatari
  if (!DESTINATARIS_VALID.includes(destinatari)) {
    return res.status(400).json({ 
      message: "Destinatari no vàlid.",
      opcions_disponibles: DESTINATARIS_VALID
    });
  }

  try {
    const newId = await Enquesta.create({ titol, destinatari });

    // Log
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'CREATE',
      taula_afectada: 'enquestes',
      valor_nou: { id: newId, titol, destinatari }
    });

    res.status(201).json({ id: newId, titol, destinatari, message: "Enquesta creada correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEnquesta = async (req, res) => {
  const { id } = req.params;
  try {
    const oldData = await Enquesta.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat l'enquesta." });
    }

    // Borrat en cascada (gestionat per la BBDD)
    await Enquesta.delete(id);

    // Log
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'DELETE',
      taula_afectada: 'enquestes',
      valor_anterior: oldData
    });

    res.json({ message: "Enquesta eliminada correctament (i les seves preguntes)." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- PREGUNTES ---

const getPreguntesByEnquesta = async (req, res) => {
  const { id } = req.params; // La ID de l'enquesta
  try {
    const preguntes = await Pregunta.getByEnquestaId(id);
    res.json(preguntes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPregunta = async (req, res) => {
  const { id } = req.params; // ID de l'enquesta
  const { text_pregunta, tipus } = req.body;

  if (!text_pregunta || !tipus) {
    return res.status(400).json({ message: "Text de la pregunta i tipus són obligatoris." });
  }

  // Validació de Tipus
  if (!TIPUS_PREGUNTA_VALID.includes(tipus)) {
    return res.status(400).json({ 
      message: "Tipus de pregunta no vàlid.",
      opcions_disponibles: TIPUS_PREGUNTA_VALID
    });
  }

  // Validar que l'enquesta existeix
  const enquesta = await Enquesta.findById(id);
  if (!enquesta) {
    return res.status(404).json({ message: "L'enquesta especificada no existeix." });
  }

  try {
    const newId = await Pregunta.create({ 
      enquesta_id: id, 
      text_pregunta, 
      tipus 
    });

    // Log
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'CREATE',
      taula_afectada: 'preguntes',
      valor_nou: { id: newId, enquesta_id: id, text_pregunta, tipus }
    });

    res.status(201).json({ id: newId, text_pregunta, tipus, message: "Pregunta afegida correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePregunta = async (req, res) => {
  const { id } = req.params; // ID de la pregunta
  try {
    const oldData = await Pregunta.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "No s'ha trobat la pregunta." });
    }

    await Pregunta.delete(id);

    // Log
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'DELETE',
      taula_afectada: 'preguntes',
      valor_anterior: oldData
    });

    res.json({ message: "Pregunta eliminada correctament." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEnquestes,
  createEnquesta,
  deleteEnquesta,
  getPreguntesByEnquesta,
  createPregunta,
  deletePregunta
};
