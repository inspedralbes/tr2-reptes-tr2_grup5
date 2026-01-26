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

    // 2. Preparem la llista
    let llista = [];
    if (Array.isArray(users)) {
      llista = users;
    }

    // 3. Construïm el resultat normalitzat amb un bucle for
    const normalized = [];
    for (let i = 0; i < llista.length; i++) {
      const u = llista[i];
      const userObj = {};
      userObj.id = u.id;
      userObj.email = u.email;
      userObj.rol = u.rol;
      userObj.ultim_acces = u.ultim_acces;
      if (u.nom_centre) {
        userObj.nom_centre = u.nom_centre;
      } else {
        userObj.nom_centre = null;
      }
      normalized.push(userObj);
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
  // 1. Obtenim els paràmetres de la petició
  let emailRaw = req.body.email;
  if (typeof emailRaw !== "string") emailRaw = "";
  const email = emailRaw.trim().toLowerCase();
  
  const password = req.body.password;
  
  let rolRaw = req.body.rol;
  if (!rolRaw) rolRaw = "";
  const rol = rolRaw.toUpperCase();
  
  let centre_id = null;
  if (req.body.centre_id != null) {
    centre_id = Number(req.body.centre_id);
  }
  
  let nomRaw = req.body.nom;
  if (typeof nomRaw !== "string") nomRaw = "";
  const nom = nomRaw.trim() || null;
  
  let cognomsRaw = req.body.cognoms;
  if (typeof cognomsRaw !== "string") cognomsRaw = "";
  const cognoms = cognomsRaw.trim() || null;
  
  let usuariIdLog = null;
  if (req.user) usuariIdLog = req.user.id;

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

    // 2. Creació ADMIN
    if (rol === "ADMIN") {
      const newId = await User.create({
        email: email,
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

    // 3. Creació PROFESSOR
    const newUserId = await User.create({
      email: email,
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

// C) --- Obtenir un usuari per ID ---
const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No s'ha trobat l'usuari" });
    }
    let rol = "";
    if (user.rol) rol = user.rol.toUpperCase();
    
    // 1. Construir objecte de resposta bàsic
    const resData = { 
        id: user.id, 
        email: user.email, 
        rol: rol 
    };

    // 2. Afegir detalls segons rol
    if (rol === "ADMIN") {
      const result = await db.query("SELECT nom, cognoms FROM administradors WHERE user_id = ?", [id]);
      const rows = result[0];
      if (rows && rows[0]) {
          resData.nom = rows[0].nom;
          resData.cognoms = rows[0].cognoms;
      } else {
          resData.nom = null;
          resData.cognoms = null;
      }
      resData.centre_id = null;
    } else if (rol === "PROFESSOR") {
      const result = await db.query("SELECT nom, cognoms, centre_id FROM professors WHERE user_id = ?", [id]);
      const rows = result[0];
      if (rows && rows[0]) {
          resData.nom = rows[0].nom;
          resData.cognoms = rows[0].cognoms;
          resData.centre_id = rows[0].centre_id;
      } else {
          resData.nom = null;
          resData.cognoms = null;
          resData.centre_id = null;
      }
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

// D) --- Actualitzar un usuari ---
const updateUser = async (req, res) => {
  const id = req.params.id;
  const b = req.body;
  let usuariIdLog = null;
  if (req.user) usuariIdLog = req.user.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No s'ha trobat l'usuari" });
    }
    
    let rol = "";
    if (user.rol) rol = user.rol.toUpperCase();

    // 1. Validar email
    let email = "";
    if (typeof b.email === "string") email = b.email.trim().toLowerCase();
    
    let oldEmail = "";
    if (user.email) oldEmail = user.email.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "L'email és obligatori." });
    }
    if (email !== oldEmail) {
      const existent = await User.findByEmail(email);
      if (existent) {
        return res.status(409).json({ message: "Ja existeix un usuari amb aquest email." });
      }
    }

    // 2. Validar password
    let pwd = "";
    if (typeof b.password === "string") pwd = b.password.trim();
    if (pwd && pwd.length < 6) {
      return res.status(400).json({ message: "La contrasenya ha de tenir almenys 6 caràcters." });
    }

    // 3. Obtenir nom i cognoms
    let nom = null;
    if (typeof b.nom === "string") nom = b.nom.trim();
    if (nom === "") nom = null;
    
    let cognoms = null;
    if (typeof b.cognoms === "string") cognoms = b.cognoms.trim();
    if (cognoms === "") cognoms = null;
    
    // 4. Validar centre_id per a professor
    let centre_id = null;
    if (b.centre_id != null) centre_id = Number(b.centre_id);

    if (rol === "PROFESSOR" && centre_id == null) {
      return res.status(400).json({ message: "Cal seleccionar un centre per a un professor." });
    }
    if (rol === "PROFESSOR" && centre_id) {
      const centre = await Centre.findById(centre_id);
      if (!centre) {
        return res.status(404).json({ message: "El centre seleccionat no existeix." });
      }
    }

    // 5. Actualitzar User
    const updateData = {};
    if (email !== oldEmail) updateData.email = email;
    if (pwd && pwd.length >= 6) {
      const hashed = await bcrypt.hash(pwd, 10);
      updateData.password = hashed;
    }
    
    // Comprovar si objecte updateData té claus
    let hasKeys = false;
    for (let k in updateData) {
        hasKeys = true;
        break;
    }
    if (hasKeys) {
      await User.update(id, updateData);
    }

    // 6. Actualitzar taules relacionades
    if (rol === "ADMIN") {
      const result = await db.query("SELECT id FROM administradors WHERE user_id = ?", [id]);
      const rows = result[0];
      if (rows && rows.length > 0) {
        await db.query("UPDATE administradors SET nom = ?, cognoms = ? WHERE user_id = ?", [nom, cognoms, id]);
      } else if (nom || cognoms) {
        await db.query("INSERT INTO administradors (user_id, nom, cognoms) VALUES (?, ?, ?)", [id, nom, cognoms]);
      }
    } else if (rol === "PROFESSOR") {
      await db.query("UPDATE professors SET nom = ?, cognoms = ?, centre_id = ? WHERE user_id = ?", [nom, cognoms, centre_id, id]);
    }

    // 7. Log
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
  let usuariIdLog = null;
  if (req.user) usuariIdLog = req.user.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No s'ha trobat l'usuari per eliminar" });
    }

    let rol = "";
    if (user.rol) rol = user.rol.toUpperCase();

    // 1. L'administrador no pot eliminar administradors
    if (rol === "ADMIN") {
      return res.status(403).json({ message: "No es pot eliminar un administrador." });
    }

    // 2. Si és PROFESSOR, s'usa User.deleteProfessor
    if (rol === "PROFESSOR") {
      const professor = await Professor.getByUserId(id);
      if (professor) {
        const result = await User.deleteProfessor(professor.id, usuariIdLog);
        if (!result.success) {
          return res.status(404).json({ message: result.message });
        }
        return res.json({ message: "Usuari i professor eliminats correctament" });
      }
    }

    // 3. Resta d'usuaris: User.delete + log
    const deleted = await User.delete(id);
    if (deleted) {
      try {
        let userEmail = "";
        if (user.email) userEmail = user.email;
        
        let userRol = "";
        if (user.rol) userRol = user.rol;

        const txtAnterior = "Usuari id " + user.id + ", email '" + userEmail + "', rol " + userRol + ", abans d'eliminar.";
        const txtNou = "Eliminat l'usuari '" + userEmail + "' (id: " + user.id + ").";
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
