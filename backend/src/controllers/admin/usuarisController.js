// ======================================
// Importem les dependències
// ======================================

const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Log = require("../../models/Log");
const Professor = require("../../models/Professor");
const Centre = require("../../models/Centre");
const db = require("../../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador d'usuaris (admin): Obtenir el llistat d'usuaris, crear i eliminar

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir tots els usuaris ---
const getAllUsers = async (req, res) => {
  try {
    // 1. Obtenim tots els usuaris des del model
    const users = await User.getAll();

    // 2. Preparem la llista: si no és un array, comencem amb array buit
    let llista = [];
    if (Array.isArray(users)) {
      llista = users;
    }

    // 3. Construïm el resultat normalitzat (només els camps que el frontend espera) amb un bucle for
    const normalized = [];
    for (let i = 0; i < llista.length; i++) {
      const u = llista[i];
      normalized.push({
        id: u.id,
        email: u.email,
        rol: u.rol,
        ultim_acces: u.ultim_acces,
        nom_centre: u.nom_centre || null
      });
    }

    // 4. Retornem el resultat
    res.json(normalized);
  } catch (error) {
    console.error("Error obtenint usuaris:", error);
    res.status(500).json({ message: "Error al obtenir usuaris." });
  }
};

// B) --- Crear un nou usuari (ADMIN o PROFESSOR) ---
const createUser = async (req, res) => {
  const email = (typeof req.body.email === "string" ? req.body.email : "").trim().toLowerCase();
  const password = req.body.password;
  const rol = (req.body.rol || "").toUpperCase();
  const centre_id = req.body.centre_id != null ? Number(req.body.centre_id) : null;
  const nom = (typeof req.body.nom === "string" ? req.body.nom : "").trim() || null;
  const cognoms = (typeof req.body.cognoms === "string" ? req.body.cognoms : "").trim() || null;
  const usuariIdLog = req.user ? req.user.id : null;

  if (!email) {
    return res.status(400).json({ message: "L'email és obligatori." });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "La contrasenya és obligatòria i ha de tenir almenys 6 caràcters." });
  }
  if (rol !== "ADMIN" && rol !== "PROFESSOR") {
    return res.status(400).json({ message: "El rol ha de ser ADMIN o PROFESSOR." });
  }

  if (rol === "PROFESSOR") {
    if (!centre_id) {
      return res.status(400).json({ message: "Cal seleccionar un centre per a un professor." });
    }
    const centre = await Centre.findById(centre_id);
    if (!centre) {
      return res.status(404).json({ message: "El centre seleccionat no existeix." });
    }
  }

  const existent = await User.findByEmail(email);
  if (existent) {
    return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (rol === "ADMIN") {
      const newId = await User.create({
        email,
        password: hashedPassword,
        rol: "ADMIN"
      });
      if (nom || cognoms) {
        await db.query(
          "INSERT INTO administradors (user_id, nom, cognoms) VALUES (?, ?, ?)",
          [newId, nom, cognoms]
        );
      }
      try {
        await Log.create({
          usuari_id: usuariIdLog,
          accio: "CREATE",
          taula_afectada: "usuaris",
          valor_anterior: null,
          valor_nou: "Creat l'usuari administrador '" + email + "' (id: " + newId + ")."
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
      return res.status(201).json({ id: newId, message: "Usuari administrador creat correctament" });
    }

    // PROFESSOR: crear usuari i després el registre a professors
    const newUserId = await User.create({
      email,
      password: hashedPassword,
      rol: "PROFESSOR"
    });
    await db.query(
      "INSERT INTO professors (nom, cognoms, user_id, centre_id) VALUES (?, ?, ?, ?)",
      [nom, cognoms, newUserId, centre_id]
    );
    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "CREATE",
        taula_afectada: "usuaris",
        valor_anterior: null,
        valor_nou: "Creat l'usuari professor '" + email + "' (id: " + newUserId + "), centre_id: " + centre_id + "."
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }
    return res.status(201).json({ id: newUserId, message: "Usuari professor creat correctament" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
    }
    res.status(500).json({ message: error.message || "Error en crear l'usuari." });
  }
};

// C) --- Obtenir un usuari per ID (per al formulari d'edició) ---
const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No s'ha trobat l'usuari" });
    }
    const rol = (user.rol || "").toUpperCase();
    const resData = { id: user.id, email: user.email, rol };

    if (rol === "ADMIN") {
      const [rows] = await db.query("SELECT nom, cognoms FROM administradors WHERE user_id = ?", [id]);
      resData.nom = (rows[0] && rows[0].nom) || null;
      resData.cognoms = (rows[0] && rows[0].cognoms) || null;
      resData.centre_id = null;
    } else if (rol === "PROFESSOR") {
      const [rows] = await db.query("SELECT nom, cognoms, centre_id FROM professors WHERE user_id = ?", [id]);
      resData.nom = (rows[0] && rows[0].nom) || null;
      resData.cognoms = (rows[0] && rows[0].cognoms) || null;
      resData.centre_id = (rows[0] && rows[0].centre_id) || null;
    } else {
      resData.nom = null;
      resData.cognoms = null;
      resData.centre_id = null;
    }
    res.json(resData);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al obtenir l'usuari." });
  }
};

// D) --- Actualitzar un usuari (email, password opcional, nom, cognoms; si PROFESSOR: centre_id) ---
const updateUser = async (req, res) => {
  const id = req.params.id;
  const b = req.body;
  const usuariIdLog = req.user ? req.user.id : null;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No s'ha trobat l'usuari" });
    }
    const rol = (user.rol || "").toUpperCase();

    const email = (typeof b.email === "string" ? b.email : "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "L'email és obligatori." });
    }
    if (email !== (user.email || "").toLowerCase()) {
      const existent = await User.findByEmail(email);
      if (existent) {
        return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
      }
    }

    const pwd = typeof b.password === "string" ? b.password.trim() : "";
    if (pwd && pwd.length < 6) {
      return res.status(400).json({ message: "La contrasenya ha de tenir almenys 6 caràcters." });
    }

    const nom = (typeof b.nom === "string" ? b.nom : "").trim() || null;
    const cognoms = (typeof b.cognoms === "string" ? b.cognoms : "").trim() || null;
    const centre_id = b.centre_id != null ? Number(b.centre_id) : null;

    if (rol === "PROFESSOR" && centre_id == null) {
      return res.status(400).json({ message: "Cal seleccionar un centre per a un professor." });
    }
    if (rol === "PROFESSOR" && centre_id) {
      const centre = await Centre.findById(centre_id);
      if (!centre) {
        return res.status(404).json({ message: "El centre seleccionat no existeix." });
      }
    }

    const updateData = {};
    if (email !== (user.email || "").toLowerCase()) updateData.email = email;
    if (pwd && pwd.length >= 6) {
      const hashed = await bcrypt.hash(pwd, 10);
      updateData.password = hashed;
    }
    if (Object.keys(updateData).length > 0) {
      await User.update(id, updateData);
    }

    if (rol === "ADMIN") {
      const [rows] = await db.query("SELECT id FROM administradors WHERE user_id = ?", [id]);
      if (rows && rows.length > 0) {
        await db.query("UPDATE administradors SET nom = ?, cognoms = ? WHERE user_id = ?", [nom, cognoms, id]);
      } else if (nom || cognoms) {
        await db.query("INSERT INTO administradors (user_id, nom, cognoms) VALUES (?, ?, ?)", [id, nom, cognoms]);
      }
    } else if (rol === "PROFESSOR") {
      await db.query("UPDATE professors SET nom = ?, cognoms = ?, centre_id = ? WHERE user_id = ?", [nom, cognoms, centre_id, id]);
    }

    try {
      await Log.create({
        usuari_id: usuariIdLog,
        accio: "UPDATE",
        taula_afectada: "usuaris",
        valor_anterior: "Usuari id " + id + " abans d'actualitzar.",
        valor_nou: "Actualitzat l'usuari id " + id + " (email: " + email + ")."
      });
    } catch (logErr) {
      console.error("Error creant log d'auditoria:", logErr.message);
    }
    res.json({ message: "Usuari actualitzat correctament" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
    }
    res.status(500).json({ message: error.message || "Error en actualitzar l'usuari." });
  }
};

// E) --- Eliminar un usuari ---
const deleteUser = async (req, res) => {
  const id = req.params.id;
  const usuariIdLog = req.user ? req.user.id : null;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No s'ha trobat l'usuari per eliminar" });
    }

    // L'administrador no pot eliminar administradors
    if ((user.rol || "").toUpperCase() === "ADMIN") {
      return res.status(403).json({ message: "No es pot eliminar un administrador." });
    }

    // Si és PROFESSOR, s'usa User.deleteProfessor (elimina professor, usuari i registra log)
    if ((user.rol || "").toUpperCase() === "PROFESSOR") {
      const professor = await Professor.getByUserId(id);
      if (professor) {
        const result = await User.deleteProfessor(professor.id, usuariIdLog);
        if (!result.success) {
          return res.status(404).json({ message: result.message });
        }
        return res.json({ message: "Usuari i professor eliminats correctament" });
      }
    }

    // Resta d'usuaris: User.delete + log
    const deleted = await User.delete(id);
    if (deleted) {
      try {
        const txtAnterior = "Usuari id " + user.id + ", email '" + (user.email || "") + "', rol " + (user.rol || "") + ", abans d'eliminar.";
        const txtNou = "Eliminat l'usuari '" + (user.email || "") + "' (id: " + user.id + ").";
        await Log.create({
          usuari_id: usuariIdLog,
          accio: "DELETE",
          taula_afectada: "usuaris",
          valor_anterior: txtAnterior,
          valor_nou: txtNou
        });
      } catch (logErr) {
        console.error("Error creant log d'auditoria:", logErr.message);
      }
    }

    res.json({ message: "Usuari eliminat correctament" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(409).json({ message: "No es pot eliminar l'usuari perquè té registres associats." });
    }
    res.status(500).json({ message: error.message || "Error al eliminar l'usuari." });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
