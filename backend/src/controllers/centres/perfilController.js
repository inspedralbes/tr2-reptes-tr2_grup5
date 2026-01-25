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
        return res.status(404).json({ message: "Centre no trobat" });
      }

      // 4. Obtenim la configuració d'inscripció
      const configs = await require("../../models/Config").getAll();
      const configMap = {};
      configs.forEach(c => configMap[c.clau] = c.valor);

      // 5. Retornem el centre amb la configuració
      res.json({
        ...centre,
        config: {
          enrollment_start: configMap['enrollment_start'],
          enrollment_end: configMap['enrollment_end']
        }
      });
    } catch (error) {
      // 4. En cas d'error, retornem error 500
      console.error("Error al obtenir el perfil del centre:", error);
      res.status(500).json({ message: "Error al obtenir el perfil" });
    }
  }
};

module.exports = perfilController;
