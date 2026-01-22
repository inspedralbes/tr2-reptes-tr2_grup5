// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

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
