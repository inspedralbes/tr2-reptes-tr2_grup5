// ======================================
// Importem les dependències
// ======================================

const Centre = require("../../models/Centre");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de perfil: Gestiona les operacions relacionades amb el perfil del centre

// ======================================
// Declaracions de funcions
// ======================================

const perfilController = {
  // A) --- Obtenir el perfil del centre autenticat ---
  getPerfil: async (req, res) => {
    try {
      // 1. Obtenim l'ID de l'usuari des del token JWT
      const userId = req.user.id;

      // 2. Busquem el centre associat a l'usuari
      const centre = await Centre.findByUserId(userId);

      // 3. Comprovem si el centre existeix
      if (!centre) {
        res.status(404).json({ message: "Centre no trobat" });
      } else {
        res.json(centre);
      }
    } catch (error) {
      // 4. En cas d'error, retornem error 500
      console.error("Error al obtenir el perfil del centre:", error);
      res.status(500).json({ message: "Error al obtenir el perfil" });
    }
  }
};

module.exports = perfilController;
