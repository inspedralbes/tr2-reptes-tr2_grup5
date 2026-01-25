// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");
const Log = require("./Log");

// ======================================
// Definició de l'Esquema
// ======================================

// Model User: Gestiona les operacions relacionades amb la taula 'usuaris'

// ======================================
// Declaracions de funcions
// ======================================

const User = {
  // A) --- Buscar un usuari per ID ---
  findById: async (id) => {
    // 1. Executem la consulta SQL per buscar l'usuari
    const result = await db.query("SELECT * FROM usuaris WHERE id = ?", [id]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Buscar un usuari per email (per al login) ---
  findByEmail: async (email) => {
    // 1. Executem la consulta SQL per buscar l'usuari per email
    const result = await db.query("SELECT * FROM usuaris WHERE email = ?", [email]);
    const rows = result[0];
    
    // 2. Retornem el primer resultat o undefined si no existeix
    if (rows.length > 0) {
      return rows[0];
    } else {
      return undefined;
    }
  },

  // A) --- Crear un nou usuari amb contrasenya hashejada ---
  create: async (userData) => {
    // 1. Obtenim les dades de l'usuari
    const email = userData.email;
    const password = userData.password;
    const rol = userData.rol;
    
    // 2. Executem la consulta SQL per inserir el nou usuari
    const result = await db.query(
      "INSERT INTO usuaris (email, password, rol, ultim_acces) VALUES (?, ?, ?, NOW())",
      [email, password, rol]
    );
    
    // 3. Obtenim l'ID del registre inserit
    const insertId = result[0].insertId;
    
    // 4. Retornem l'ID del nou usuari
    return insertId;
  },

  // A) --- Eliminar un usuari ---
  delete: async (id) => {
    const result = await db.query("DELETE FROM usuaris WHERE id = ?", [id]);
    const affectedRows = result[0].affectedRows;
    return affectedRows > 0;
  },

  // A) --- Actualitzar email i/o password d'un usuari (només els camps proporcionats) ---
  update: async (id, data) => {
    const parts = [];
    const vals = [];
    if (data.email != null) {
      parts.push("email = ?");
      vals.push(data.email);
    }
    if (data.password != null) {
      parts.push("password = ?");
      vals.push(data.password);
    }
    if (parts.length === 0) return false;
    vals.push(id);
    const sql = "UPDATE usuaris SET " + parts.join(", ") + " WHERE id = ?";
    const result = await db.query(sql, vals);
    return result[0].affectedRows > 0;
  },

  // B) --- deleteCentre: elimina el centre, l'usuari del centre, els professors i els seus usuaris, i totes les relacions (peticions, peticio_detalls, etc.). Registra el log. ---
  deleteCentre: async (centreId, usuariIdLog) => {
    const [rowsCentre] = await db.query("SELECT * FROM centres WHERE id = ?", [centreId]);
    if (!rowsCentre || rowsCentre.length === 0) {
      return { success: false, message: "No s'ha trobat el centre per eliminar" };
    }
    const centre = rowsCentre[0];

    const [rowsProfs] = await db.query("SELECT user_id FROM professors WHERE centre_id = ?", [centreId]);
    const professorUserIds = (rowsProfs || []).map(function (r) { return r.user_id; }).filter(Boolean);

    const userIdsToDelete = [centre.user_id].concat(professorUserIds).filter(Boolean);
    const uniqueIds = [...new Set(userIdsToDelete)];

    await db.query("DELETE FROM centres WHERE id = ?", [centreId]);

    for (let i = 0; i < uniqueIds.length; i++) {
      await db.query("DELETE FROM usuaris WHERE id = ?", [uniqueIds[i]]);
    }

    const txtAnterior = "Centre id " + centre.id + ", nom '" + (centre.nom_centre || "") + "', codi " + (centre.codi_centre || "") + ", i l'usuari/user_id " + (centre.user_id || "—") + ", abans d'eliminar.";
    const txtNou = "Eliminat el centre '" + (centre.nom_centre || "") + "' (codi: " + (centre.codi_centre || "") + ", id: " + centre.id + "), l'usuari associat i els professors del centre.";
    await Log.create({
      usuari_id: usuariIdLog || null,
      accio: "DELETE",
      taula_afectada: "centres",
      valor_anterior: txtAnterior,
      valor_nou: txtNou
    });

    return { success: true };
  },

  // C) --- deleteProfessor: elimina el professor, l'usuari associat i les seves relacions (referents_assignats, etc.). Registra el log. ---
  deleteProfessor: async (professorId, usuariIdLog) => {
    const [rowsProf] = await db.query("SELECT * FROM professors WHERE id = ?", [professorId]);
    if (!rowsProf || rowsProf.length === 0) {
      return { success: false, message: "No s'ha trobat el professor per eliminar" };
    }
    const professor = rowsProf[0];
    const userId = professor.user_id;

    await db.query("DELETE FROM professors WHERE id = ?", [professorId]);
    await db.query("DELETE FROM usuaris WHERE id = ?", [userId]);

    const txtAnterior = "Professor id " + professor.id + ", user_id " + (professor.user_id || "—") + ", nom " + (professor.nom || "") + " " + (professor.cognoms || "") + ", abans d'eliminar.";
    const txtNou = "Eliminat el professor '" + (professor.nom || "") + " " + (professor.cognoms || "") + "' (id: " + professor.id + ") i l'usuari associat.";
    await Log.create({
      usuari_id: usuariIdLog || null,
      accio: "DELETE",
      taula_afectada: "professors",
      valor_anterior: txtAnterior,
      valor_nou: txtNou
    });

    return { success: true };
  },

  // A) --- Obtenir tots els usuaris amb dades del centre associat ---
  getAll: async () => {
    // 1. Definim la consulta SQL per obtenir usuaris i centres
    const sql = `
      SELECT
        u.id AS id,
        u.email AS email,
        u.rol AS rol,
        u.ultim_acces AS ultim_acces,
        c.id AS centre_id,
        c.codi_centre AS codi_centre,
        c.nom_centre AS nom_centre
      FROM usuaris u
      LEFT JOIN centres c ON c.user_id = u.id
      ORDER BY u.ultim_acces DESC
    `;
    
    // 2. Executem la consulta
    const result = await db.query(sql);
    const rows = result[0];
    
    // 3. Retornem tots els resultats
    return rows;
  }
};

module.exports = User;
