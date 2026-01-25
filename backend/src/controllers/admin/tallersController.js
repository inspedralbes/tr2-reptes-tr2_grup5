// ======================================
// Importem les dependències
// ======================================

const Taller = require("../../models/Taller");
const Log = require("../../models/Log");

// ======================================
// Definició de l'Esquema
// ======================================

const SECTORS_VALID = [
  "Agroalimentari", "Manufacturer", "Energia i Aigua", "Construcció",
  "Comerç i Turisme", "Transport", "Hoteleria", "Informació i Comunicació",
  "Financer", "Immobiliari", "Professional"
];

// Controlador de tallers (admin): CRUD de tallers

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els tallers ---
const getAllTallers = async (req, res) => {
  try {
    // 1. Obtenim el filtre de la query; si no ve, per defecte 'active'
    let filter = req.query.filter;
    if (!filter) {
      filter = "active";
    }

    // 2. Obtenim els tallers i els retornem
    const tallers = await Taller.getAll(filter);
    res.json(tallers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// B) --- Obtenir un taller per ID (per a l'edició) ---
const getTallerById = async (req, res) => {
  try {
    // 1. Obtenim l'ID dels paràmetres
    const id = req.params.id;

    // 2. Busquem el taller
    const taller = await Taller.findById(id);

    if (!taller) {
      return res.status(404).json({ message: "Taller no trobat" });
    }

    res.json(taller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// C) --- Crear un nou taller ---
const createTaller = async (req, res) => {
  // 1. Obtenim les dades del cos de la petició
  const titol = req.body.titol;
  const descripcio = req.body.descripcio;
  const sector = req.body.sector;
  const modalitat = req.body.modalitat;
  const trimestres_disponibles = req.body.trimestres_disponibles;
  const places_maximes = req.body.places_maximes;
  const adreca = req.body.adreca;
  const ubicacio = req.body.ubicacio;
  const data_execucio = req.body.data_execucio;

  if (!titol || !modalitat || !sector) {
    return res.status(400).json({ message: "El títol, el sector i la modalitat són obligatoris" });
  }

  if (!SECTORS_VALID.includes(sector)) {
    return res.status(400).json({ message: "Sector no vàlid." });
  }

  if (!["A", "B", "C"].includes(modalitat)) {
    return res.status(400).json({ message: "La modalitat ha de ser 'A', 'B' o 'C'" });
  }

  // 2. Capacitat: per defecte 12 si no ve
  let capacitat = places_maximes;
  if (!capacitat) {
    capacitat = 12;
  }
  if (capacitat < 1) {
    return res.status(400).json({ message: "Les places han de ser com a mínim 1." });
  }

  try {
    // 3. Creem el taller a la base de dades
    const newId = await Taller.create({
      titol: titol,
      descripcio: descripcio,
      sector: sector,
      modalitat: modalitat,
      trimestres_disponibles: trimestres_disponibles,
      places_maximes: capacitat,
      adreca,
      ubicacio,
      data_execucio
    });

    // 4. Registrem el log d'auditoria
    let usuariIdLog = null;
    if (req.user) {
      usuariIdLog = req.user.id;
    }
    const txtNou = "Creat el taller '" + (titol || "") + "' (id: " + newId + ", sector: " + (sector || "") + ", modalitat: " + (modalitat || "") + ", places: " + capacitat + ").";
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "CREATE",
        taula_afectada: "tallers",
        valor_anterior: null,
        valor_nou: txtNou
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }

    // 5. Retornem èxit
    res.status(201).json({ id: newId, message: "Taller creat correctament" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// D) --- Actualitzar un taller existent ---
const updateTaller = async (req, res) => {
  // 1. Obtenim l'ID i les dades noves
  const id = req.params.id;
  const newData = req.body;

  try {
    // 2. Obtenim les dades antigues
    const oldData = await Taller.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "Taller no trobat" });
    }

    const updated = await Taller.update(id, newData);

    if (updated) {
      // 3. Registrem el log d'auditoria
      let usuariIdLog = null;
      if (req.user) {
        usuariIdLog = req.user.id;
      }
      const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || "") + "', sector " + (oldData.sector || "") + ", abans d'actualitzar.";
      const txtNou = "Actualitzat el taller id " + id + " (títol: '" + (newData.titol || oldData.titol || "") + "', sector: " + (newData.sector || oldData.sector || "") + ").";
      try {
        await Log.create({
          usuari_id: usuariIdLog,
          accio: "UPDATE",
          taula_afectada: "tallers",
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

// E) --- Eliminar o arxivar un taller ---
const deleteTaller = async (req, res) => {
  // 1. Obtenim l'ID dels paràmetres
  const id = req.params.id;

  try {
    // 2. Obtenim les dades abans d'actuar
    const oldData = await Taller.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "Taller no trobat" });
    }

    const hasDeps = await Taller.hasDependencies(id);

    if (hasDeps) {
      // 3. Si té dependències, arxivem en lloc d'eliminar
      await Taller.archive(id);
      let usuariIdLog = null;
      if (req.user) {
        usuariIdLog = req.user.id;
      }
      const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || "") + "', actiu: 1, abans d'arxivar.";
      const txtNou = "Arxivat el taller '" + (oldData.titol || "") + "' (id: " + id + ") per tenir peticions associades.";
      try {
        await Log.create({
          usuari_id: usuariIdLog,
          accio: "ARCHIVE",
          taula_afectada: "tallers",
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
      return res.json({ message: "Taller arxivat correctament (té peticions associades).", archived: true });
    }

    // 4. Si no té dependències, eliminem
    await Taller.delete(id);
    let usuariIdLog = null;
    if (req.user) {
      usuariIdLog = req.user.id;
    }
    const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || "") + "', sector " + (oldData.sector || "") + ", abans d'eliminar.";
    const txtNou = "Eliminat el taller '" + (oldData.titol || "") + "' (id: " + id + ").";
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "DELETE",
        taula_afectada: "tallers",
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

module.exports = {
  getAllTallers,
  getTallerById,
  createTaller,
  updateTaller,
  deleteTaller
};