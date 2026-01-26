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
    const rows = result[0];
    const insertId = rows.insertId;
    
    // 4. Retornem l'ID del nou usuari
    return insertId;
  },

  // A) --- Eliminar un usuari ---
  delete: async (id) => {
    // 1. Executem l'eliminació
    const result = await db.query("DELETE FROM usuaris WHERE id = ?", [id]);
    const rows = result[0];
    const affectedRows = rows.affectedRows;
    
    // 2. Retornem cert si s'ha eliminat
    if (affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  },

  // A) --- Actualitzar email i/o password d'un usuari (només els camps proporcionats) ---
  update: async (id, data) => {
    // 1. Preparem els camps a actualitzar
    const parts = [];
    const vals = [];
    
    if (data.email !== null && data.email !== undefined) {
      parts.push("email = ?");
      vals.push(data.email);
    }
    if (data.password !== null && data.password !== undefined) {
      parts.push("password = ?");
      vals.push(data.password);
    }
    
    // 2. Si no hi ha camps, sortim
    if (parts.length === 0) {
      return false;
    }
    
    // 3. Afegim l'ID al final dels valors
    vals.push(id);
    
    // 4. Construïm la consulta manualment amb un bucle
    let sqlSet = "";
    for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
            sqlSet = sqlSet + ", ";
        }
        sqlSet = sqlSet + parts[i];
    }

    const sql = "UPDATE usuaris SET " + sqlSet + " WHERE id = ?";
    
    // 5. Executem la consulta
    const result = await db.query(sql, vals);
    const rows = result[0];
    return rows.affectedRows > 0;
  },

  // B) --- Elimina el centre, l'usuari, professors i relacions ---
  deleteCentre: async (centreId, usuariIdLog) => {
    // 1. Busquem el centre
    const resultCentre = await db.query("SELECT * FROM centres WHERE id = ?", [centreId]);
    const rowsCentre = resultCentre[0];
    
    if (!rowsCentre || rowsCentre.length === 0) {
      const resp = {};
      resp.success = false;
      resp.message = "No s'ha trobat el centre per eliminar";
      return resp;
    }
    const centre = rowsCentre[0];

    // 2. Busquem els professors del centre
    const resultProfs = await db.query("SELECT user_id FROM professors WHERE centre_id = ?", [centreId]);
    const rowsProfs = resultProfs[0];
    
    // 3. Obtenim els IDs d'usuari dels professors manualment
    const professorUserIds = [];
    if (rowsProfs) {
        for (let i = 0; i < rowsProfs.length; i++) {
            const r = rowsProfs[i];
            if (r.user_id) {
                professorUserIds.push(r.user_id);
            }
        }
    }

    // 4. Construïm la llista d'IDs d'usuari a eliminar (centre + professors)
    const userIdsToDelete = [];
    if (centre.user_id) {
        userIdsToDelete.push(centre.user_id);
    }
    for (let i = 0; i < professorUserIds.length; i++) {
        userIdsToDelete.push(professorUserIds[i]);
    }

    // 5. Filtrem duplicats manualment
    const uniqueIds = [];
    for (let i = 0; i < userIdsToDelete.length; i++) {
        const idActual = userIdsToDelete[i];
        let jaExisteix = false;
        for (let j = 0; j < uniqueIds.length; j++) {
            if (uniqueIds[j] === idActual) {
                jaExisteix = true;
                break;
            }
        }
        if (!jaExisteix) {
            uniqueIds.push(idActual);
        }
    }

    // 6. Eliminem el centre
    await db.query("DELETE FROM centres WHERE id = ?", [centreId]);

    // 7. Eliminem els usuaris un per un
    for (let i = 0; i < uniqueIds.length; i++) {
      await db.query("DELETE FROM usuaris WHERE id = ?", [uniqueIds[i]]);
    }

    // 8. Registrem el log
    let txtAnterior = "Centre id " + centre.id + ", nom '";
    if (centre.nom_centre) txtAnterior = txtAnterior + centre.nom_centre;
    txtAnterior = txtAnterior + "', codi ";
    if (centre.codi_centre) txtAnterior = txtAnterior + centre.codi_centre;
    txtAnterior = txtAnterior + ", i l'usuari/user_id ";
    if (centre.user_id) txtAnterior = txtAnterior + centre.user_id;
    else txtAnterior = txtAnterior + "—";
    txtAnterior = txtAnterior + ", abans d'eliminar.";

    let txtNou = "Eliminat el centre '";
    if (centre.nom_centre) txtNou = txtNou + centre.nom_centre;
    txtNou = txtNou + "' (codi: ";
    if (centre.codi_centre) txtNou = txtNou + centre.codi_centre;
    txtNou = txtNou + ", id: " + centre.id + "), l'usuari associat i els professors del centre.";

    const logData = {};
    if (usuariIdLog) logData.usuari_id = usuariIdLog;
    else logData.usuari_id = null;
    
    logData.accio = "DELETE";
    logData.taula_afectada = "centres";
    logData.valor_anterior = txtAnterior;
    logData.valor_nou = txtNou;

    await Log.create(logData);

    // 9. Retornem èxit
    const finalResp = {};
    finalResp.success = true;
    return finalResp;
  },

  // C) --- Elimina el professor i l'usuari associat ---
  deleteProfessor: async (professorId, usuariIdLog) => {
    // 1. Busquem el professor
    const resultProf = await db.query("SELECT * FROM professors WHERE id = ?", [professorId]);
    const rowsProf = resultProf[0];
    
    if (!rowsProf || rowsProf.length === 0) {
      const resp = {};
      resp.success = false;
      resp.message = "No s'ha trobat el professor per eliminar";
      return resp;
    }
    
    const professor = rowsProf[0];
    const userId = professor.user_id;

    // 2. Eliminem
    await db.query("DELETE FROM professors WHERE id = ?", [professorId]);
    await db.query("DELETE FROM usuaris WHERE id = ?", [userId]);

    // 3. Registrem el log
    let txtAnterior = "Professor id " + professor.id + ", user_id ";
    if (professor.user_id) txtAnterior = txtAnterior + professor.user_id;
    else txtAnterior = txtAnterior + "—";
    txtAnterior = txtAnterior + ", nom ";
    if (professor.nom) txtAnterior = txtAnterior + professor.nom;
    txtAnterior = txtAnterior + " ";
    if (professor.cognoms) txtAnterior = txtAnterior + professor.cognoms;
    txtAnterior = txtAnterior + ", abans d'eliminar.";

    let txtNou = "Eliminat el professor '";
    if (professor.nom) txtNou = txtNou + professor.nom;
    txtNou = txtNou + " ";
    if (professor.cognoms) txtNou = txtNou + professor.cognoms;
    txtNou = txtNou + "' (id: " + professor.id + ") i l'usuari associat.";

    const logData = {};
    if (usuariIdLog) logData.usuari_id = usuariIdLog;
    else logData.usuari_id = null;

    logData.accio = "DELETE";
    logData.taula_afectada = "professors";
    logData.valor_anterior = txtAnterior;
    logData.valor_nou = txtNou;

    await Log.create(logData);

    // 4. Retornem èxit
    const finalResp = {};
    finalResp.success = true;
    return finalResp;
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
