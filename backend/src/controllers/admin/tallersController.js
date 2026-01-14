const Taller = require("../../models/Taller");
const Log = require("../../models/Log");

// Llista oficial de sectors segons documentació
const SECTORS_VALID = [
  "Agroalimentari",
  "Manufacturer",
  "Energia i Aigua",
  "Construcció",
  "Comerç i Turisme",
  "Transport",
  "Hoteleria",
  "Informació i Comunicació",
  "Financer",
  "Immobiliari",
  "Professional"
];

// --- 1. GET: Obtenir tots els tallers ---
// Admet query param ?filter=active|archived|all
const getAllTallers = async (req, res) => {
  try {
    const filter = req.query.filter || 'active';
    const tallers = await Taller.getAll(filter);
    res.json(tallers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. POST: Crear un nou taller ---
const createTaller = async (req, res) => {
  const {
    titol,
    descripcio,
    sector,
    modalitat,
    trimestres_disponibles,
    places_maximes,
    adreca,
    ubicacio
  } = req.body;

  // Comprovem camps obligatoris
  if (!titol || !modalitat || !sector) {
    return res.status(400).json({ message: "El títol, el sector i la modalitat són obligatoris" });
  }

  // Validació sectors
  if (!SECTORS_VALID.includes(sector)) {
    return res.status(400).json({
      message: "Sector no vàlid. Triï un dels 11 sectors oficials.",
      sectors_disponibles: SECTORS_VALID
    });
  }

  // Validació modalitat
  if (!['A', 'B', 'C'].includes(modalitat)) {
    return res.status(400).json({ message: "La modalitat ha de ser 'A', 'B' o 'C'" });
  }

  // Validació capacitat mínima
  if (places_maximes !== undefined && places_maximes < 1) {
    return res.status(400).json({ message: "Les places màximes han de ser com a mínim 1." });
  }

  try {
    const newId = await Taller.create({
      titol,
      descripcio,
      sector,
      modalitat,
      trimestres_disponibles,
      places_maximes,
      adreca,
      ubicacio
    });

    // AUDITORIA
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'CREATE',
      taula_afectada: 'tallers',
      valor_nou: { id: newId, titol, sector }
    });

    res.status(201).json({
      id: newId,
      titol,
      sector,
      modalitat,
      message: "Taller creat correctament"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. PUT: Actualitzar un taller existent ---
const updateTaller = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  const {
    sector,
    modalitat,
    places_maximes
  } = req.body;

  // Si s'actualitza el sector, validar-lo
  if (sector && !SECTORS_VALID.includes(sector)) {
    return res.status(400).json({
      message: "Sector no vàlid.",
      sectors_disponibles: SECTORS_VALID
    });
  }

  // Si s'actualitza la modalitat
  if (modalitat && !['A', 'B', 'C'].includes(modalitat)) {
    return res.status(400).json({ message: "La modalitat ha de ser 'A', 'B' o 'C'" });
  }

  // Validació de Capacitat amb lògica de negoci
  if (places_maximes !== undefined) {
    if (places_maximes < 1) {
      return res.status(400).json({ message: "Les places màximes han de ser com a mínim 1." });
    }
  }

  try {
    // Recuperar valor anterior
    const oldData = await Taller.findById(id);

    const updated = await Taller.update(id, newData);

    if (!updated) {
      return res.status(404).json({ message: "No s'ha trobat el taller per actualitzar" });
    }

    // AUDITORIA
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

// --- 4. DELETE: Eliminar un taller (o Arxivar) ---
const deleteTaller = async (req, res) => {
  const { id } = req.params;
  try {
    // Recuperar valor anterior
    const oldData = await Taller.findById(id);

    // 1. Comprovar si té dependències (fills)
    const hasDeps = await Taller.hasDependencies(id);

    if (hasDeps) {
      // Si té dependències, NO es pot borrar físicament. 
      // Així que en lloc de cridar a delete(), cridem a archive().

      const archived = await Taller.archive(id);
      if (!archived) return res.status(404).json({ message: "No s'ha trobat el taller." });

      // AUDITORIA: ARCHIVE
      await Log.create({
        usuari_id: req.user ? req.user.id : null,
        accio: 'ARCHIVE',
        taula_afectada: 'tallers',
        valor_anterior: oldData, // Estat anterior (actiu=1)
        valor_nou: { actiu: 0 }
      });

      return res.json({
        message: "El taller té activitat associada. No s'ha esborrat, però s'ha canviat l'estat a 'Arxivat' (soft-delete).",
        archived: true
      });
    }

    // 2. Si no té dependències, esborrat físic segur
    const deleted = await Taller.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "No s'ha trobat el taller per eliminar" });
    }

    // AUDITORIA: DELETE FÍSIC
    await Log.create({
      usuari_id: req.user ? req.user.id : null,
      accio: 'DELETE',
      taula_afectada: 'tallers',
      valor_anterior: oldData
    });

    res.json({ message: "Taller eliminat correctament (sense historial previ)." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTallers,
  createTaller,
  updateTaller,
  deleteTaller
};
