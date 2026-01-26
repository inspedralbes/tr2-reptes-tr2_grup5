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
    // 1. Obtenim el filtre de la query
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

// B) --- Obtenir un taller per ID ---
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

  // 2. Validar sector (bucle manual)
  let sectorValid = false;
  for (let i = 0; i < SECTORS_VALID.length; i++) {
    if (SECTORS_VALID[i] === sector) {
      sectorValid = true;
      break;
    }
  }
  if (!sectorValid) {
    return res.status(400).json({ message: "Sector no vàlid." });
  }

  // 3. Validar modalitat (bucle manual)
  let modalitatValida = false;
  if (modalitat === 'A' || modalitat === 'B' || modalitat === 'C') {
    modalitatValida = true;
  }
  if (!modalitatValida) {
    return res.status(400).json({ message: "La modalitat ha de ser 'A', 'B' o 'C'" });
  }

  // 4. Capacitat: per defecte 12 si no ve
  let capacitat = places_maximes;
  if (!capacitat) {
    capacitat = 12;
  }
  if (capacitat < 1) {
    return res.status(400).json({ message: "Les places han de ser com a mínim 1." });
  }

  try {
    // 5. Creem el taller a la base de dades
    const newId = await Taller.create({
      titol: titol,
      descripcio: descripcio,
      sector: sector,
      modalitat: modalitat,
      trimestres_disponibles: trimestres_disponibles,
      places_maximes: capacitat,
      adreca: adreca,
      ubicacio: ubicacio,
      data_execucio: data_execucio
    });

    // 6. Registrem el log d'auditoria
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

    // 7. Retornem èxit
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
      
      let tActual = "";
      if (newData.titol) tActual = newData.titol;
      else if (oldData.titol) tActual = oldData.titol;
      
      let sActual = "";
      if (newData.sector) sActual = newData.sector;
      else if (oldData.sector) sActual = oldData.sector;

      const txtAnterior = "Taller id " + oldData.id + ", títol '" + (oldData.titol || "") + "', sector " + (oldData.sector || "") + ", abans d'actualitzar.";
      const txtNou = "Actualitzat el taller id " + id + " (títol: '" + tActual + "', sector: " + sActual + ").";
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

// E) --- Eliminar un taller ---
const deleteTaller = async (req, res) => {
  // 1. Obtenim l'ID dels paràmetres
  const id = req.params.id;

  try {
    // 2. Obtenim les dades abans d'actuar
    const oldData = await Taller.findById(id);
    if (!oldData) {
      return res.status(404).json({ message: "Taller no trobat" });
    }

    // 3. Comprovem si té dependències
    const hasDeps = await Taller.hasDependencies(id);

    if (hasDeps) {
      // 4. Si té dependències, arxivem
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

    // 5. Si no té dependències, eliminem
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