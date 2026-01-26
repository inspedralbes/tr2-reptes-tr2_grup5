// ======================================
// Importem les dependències
// ======================================

const Centre = require("../../models/Centre");
const Config = require("../../models/Config");

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
      const configs = await Config.getAll();
      const configMap = {};
      
      // Bucle for clàssic
      for (let i = 0; i < configs.length; i++) {
        const c = configs[i];
        configMap[c.clau] = c.valor;
      }

      // 5. Construïm resposta sense spread operator
      const response = {};
      // Copiar propietats del centre
      for (const k in centre) {
        response[k] = centre[k];
      }
      
      // Afegir config
      const configObj = {};
      configObj.enrollment_start = configMap['enrollment_start'];
      configObj.enrollment_end = configMap['enrollment_end'];
      
      response.config = configObj;

      res.json(response);
    } catch (error) {
      console.error("Error al obtenir el perfil del centre:", error);
      res.status(500).json({ message: "Error al obtenir el perfil" });
    }
  }
};

module.exports = perfilController;
