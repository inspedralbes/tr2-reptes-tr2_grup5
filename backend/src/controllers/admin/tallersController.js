const Taller = require("../../models/Taller");
const Log = require("../../models/Log");

const SECTORS_VALID = [
  "Agroalimentari", "Manufacturer", "Energia i Aigua", "Construcció", 
  "Comerç i Turisme", "Transport", "Hoteleria", "Informació i Comunicació", 
  "Financer", "Immobiliari", "Professional"
];

const getAllTallers = async (req, res) => {
  try {
    const filter = req.query.filter || 'active';
    const tallers = await Taller.getAll(filter);
    res.json(tallers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
      // La resta de places s'inicialitza automàticament al model
      adreca,
      ubicacio
    });

    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'CREATE',
      taula_afectada: 'tallers',
      valor_nou: { id: newId, titol, sector, places_inicials: capacitat }
    });

    res.status(201).json({ id: newId, message: "Taller creat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTaller = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  try {
    const oldData = await Taller.findById(id);
    if (!oldData) return res.status(404).json({ message: "Taller no trobat" });

    // Si l'administrador canvia les places màximes, hauríem de recalcular les restants?
    // Per simplificar, aquí només actualitzem dades generals.
    
    const updated = await Taller.update(id, newData);

    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'UPDATE',
      taula_afectada: 'tallers',
      valor_anterior: oldData,
      valor_nou: { id, ...newData }
    });

    res.json({ message: "Taller actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTaller = async (req, res) => {
  const { id } = req.params;
  try {
    const oldData = await Taller.findById(id);
    const hasDeps = await Taller.hasDependencies(id);

    if (hasDeps) {
      await Taller.archive(id);
      await Log.create({
        usuari_id: req.user ? req.user.id : null,
        accio: 'ARCHIVE',
        taula_afectada: 'tallers',
        valor_nou: { id, actiu: 0 }
      });
      return res.json({ message: "Taller arxivat correctament.", archived: true });
    }

    await Taller.delete(id);
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'DELETE',
      taula_afectada: 'tallers',
      valor_anterior: oldData
    });
    res.json({ message: "Taller eliminat correctament." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllTallers, createTaller, updateTaller, deleteTaller };