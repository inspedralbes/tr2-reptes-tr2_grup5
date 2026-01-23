const Taller = require("../../models/Taller");
const Log = require("../../models/Log");

const SECTORS_VALID = [
  "Agroalimentari", "Manufacturer", "Energia i Aigua", "Construcció", 
  "Comerç i Turisme", "Transport", "Hoteleria", "Informació i Comunicació", 
  "Financer", "Immobiliari", "Professional"
];

// Obtenir tots els tallers
const getAllTallers = async (req, res) => {
  try {
    const filter = req.query.filter || 'active';
    const tallers = await Taller.getAll(filter);
    res.json(tallers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- NOVA FUNCIÓ: Obtenir un taller per ID (Necessària per a l'edició) ---
const getTallerById = async (req, res) => {
  try {
    const { id } = req.params;
    const taller = await Taller.findById(id);
    
    if (!taller) {
      return res.status(404).json({ message: "Taller no trobat" });
    }
    
    res.json(taller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nou taller
const createTaller = async (req, res) => {
  const {
    titol, descripcio, sector, modalitat,
    trimestres_disponibles, places_maximes, adreca, ubicacio
  } = req.body;

  if (!titol || !modalitat || !sector) {
    return res.status(400).json({ message: "El títol, el sector i la modalitat són obligatoris" });
  }

  if (!SECTORS_VALID.includes(sector)) {
    return res.status(400).json({ message: "Sector no vàlid." });
  }

  if (!['A', 'B', 'C'].includes(modalitat)) {
    return res.status(400).json({ message: "La modalitat ha de ser 'A', 'B' o 'C'" });
  }

  const capacitat = places_maximes || 12;
  if (capacitat < 1) {
    return res.status(400).json({ message: "Les places han de ser com a mínim 1." });
  }

  try {
    const newId = await Taller.create({
      titol,
      descripcio,
      sector,
      modalitat,
      trimestres_disponibles,
      places_maximes: capacitat,
      adreca,
      ubicacio
    });

    const txtNou = "Creat el taller '" + (titol || '') + "' (id: " + newId + ", sector: " + (sector || '') + ", modalitat: " + (modalitat || '') + ", places: " + capacitat + ").";
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null,
        accio: 'CREATE',
        taula_afectada: 'tallers',
        valor_anterior: null,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    res.status(201).json({ id: newId, message: "Taller creat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualitzar un taller existent
const updateTaller = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  try {
    const oldData = await Taller.findById(id);
    if (!oldData) return res.status(404).json({ message: "Taller no trobat" });
    
    const updated = await Taller.update(id, newData);

    if (updated) {
      const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || '') + "', sector " + (oldData.sector || '') + ", abans d'actualitzar.";
      const txtNou = "Actualitzat el taller id " + id + " (títol: '" + (newData.titol || oldData.titol || '') + "', sector: " + (newData.sector || oldData.sector || '') + ").";
      try {
        await Log.create({
          usuari_id: req.user ? req.user.id : null,
          accio: 'UPDATE',
          taula_afectada: 'tallers',
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
      res.json({ message: "Taller actualitzat correctament" });
    } else {
      res.status(400).json({ message: "No s'ha pogut actualitzar el taller" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar o arxivar un taller
const deleteTaller = async (req, res) => {
  const { id } = req.params;
  try {
    const oldData = await Taller.findById(id);
    if (!oldData) return res.status(404).json({ message: "Taller no trobat" });

    const hasDeps = await Taller.hasDependencies(id);

    if (hasDeps) {
      await Taller.archive(id);
      const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || '') + "', actiu: 1, abans d'arxivar.";
      const txtNou = "Arxivat el taller '" + (oldData.titol || '') + "' (id: " + id + ") per tenir peticions associades.";
      try {
        await Log.create({
          usuari_id: req.user ? req.user.id : null,
          accio: 'ARCHIVE',
          taula_afectada: 'tallers',
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
      return res.json({ message: "Taller arxivat correctament (té peticions associades).", archived: true });
    }

    await Taller.delete(id);
    const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || '') + "', sector " + (oldData.sector || '') + ", abans d'eliminar.";
    const txtNou = "Eliminat el taller '" + (oldData.titol || '') + "' (id: " + id + ").";
    try {
      await Log.create({
        usuari_id: req.user ? req.user.id : null,
        accio: 'DELETE',
        taula_afectada: 'tallers',
        valor_anterior: txtAnterior,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }
    res.json({ message: "Taller eliminat correctament." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exportació de totes les funcions
module.exports = { 
  getAllTallers, 
  getTallerById, // <--- Exportada correctament
  createTaller, 
  updateTaller, 
  deleteTaller 
};