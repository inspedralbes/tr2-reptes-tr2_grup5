// ======================================
// Importem les dependències
// ======================================

const User = require("../../models/User");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador d'usuaris (admin): Obtenir el llistat d'usuaris

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

module.exports = {
  getAllUsers
};
