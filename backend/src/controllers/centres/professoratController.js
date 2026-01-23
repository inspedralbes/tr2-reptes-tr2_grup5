// ======================================
// Importem les dependències
// ======================================

const Professor = require("../../models/Professor");
const Centre = require("../../models/Centre");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de professorat (centres): CRUD de professors del centre

// ======================================
// Declaracions de funcions
// ======================================

const professoratController = {
  // A) --- Obtenir els professors del centre ---
  getMeusProfessors: async (req, res) => {
        try {
            const user_id = req.user.id;
            const centre = await Centre.findByUserId(user_id);

            if (!centre) {
                return res.status(404).json({ message: "Centre no trobat per a aquest usuari." });
            }

            const professors = await Professor.getByCentreId(centre.id);
            return res.json(professors);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error al obtenir els professors del centre." });
        }
    },

  // B) --- Crear un professor ---
  createProf: async (req, res) => {
    try {
      const user_id = req.user.id;
      const nom = req.body.nom;
      const cognoms = req.body.cognoms;
      const email = req.body.email;

      // 1. Busquem el centre
      const centre = await Centre.findByUserId(user_id);
      if (!centre) {
        return res.status(404).json({ message: "Centre no trobat." });
      }

      // 2. Executem la creació (doble INSERT a la BD)
      const result = await Professor.create({
        nom: nom,
        cognoms: cognoms,
        email: email,
        centre_id: centre.id
      });

            // 3. Enviem la resposta fent servir 'result.professorId' que retorna el teu model
            return res.status(201).json({
                id: result.professorId,
                nom: nom,
                cognoms: cognoms,
                email: email,
                centre_id: centre.id
            });

        } catch (error) {
            console.error("Error al controlador professoratController:", error);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    message: "Aquest correu electrònic ja està registrat en el sistema."
                });
            }

            return res.status(500).json({ message: "Error intern al crear el professor." });
        }
    },

  // C) --- Actualitzar professor ---
  updateProfessor: async (req, res) => {
    try {
      const user_id = req.user.id;
      const prof_id = req.params.id;
      const nom = req.body.nom;
      const cognoms = req.body.cognoms;
      const email = req.body.email;

            // 1. Busquem el centre de l'usuari actual
            const centre = await Centre.findByUserId(user_id);
            if (!centre) {
                return res.status(404).json({ message: "Centre no trobat." });
            }

            // 2. Busquem el professor
            const professor = await Professor.findById(prof_id);
            if (!professor) {
                return res.status(404).json({ message: "Professor no trobat." });
            }

            // 3. Verifiquem que el professor pertanyi al centre
            if (professor.centre_id !== centre.id) {
                return res.status(403).json({ message: "No tens permís per editar aquest professor." });
            }

      // 4. Executem l'actualització
      await Professor.update(prof_id, {
        nom: nom,
        cognoms: cognoms,
        email: email,
        user_id: professor.user_id
      });

            return res.json({ message: "Professor actualitzat correctament." });

        } catch (error) {
            console.error("Error al actualitzar professor:", error);
            return res.status(500).json({ message: "Error en actualitzar el professor." });
        }
    },

  // D) --- Eliminar professor ---
  deleteProfessor: async (req, res) => {
        try {
            const user_id = req.user.id;
            const prof_id = req.params.id;

            // 1. Busquem el centre de l'usuari actual
            const centre = await Centre.findByUserId(user_id);
            if (!centre) {
                return res.status(404).json({ message: "Centre no trobat." });
            }

            // 2. Busquem el professor
            const professor = await Professor.findById(prof_id);
            if (!professor) {
                return res.status(404).json({ message: "Professor no trobat." });
            }

            // 3. Verifiquem que el professor pertanyi al centre
            if (professor.centre_id !== centre.id) {
                return res.status(403).json({ message: "No tens permís per eliminar aquest professor." });
            }

            // 4. Executem l'esborrat (professor i usuari)
            await Professor.delete(prof_id, professor.user_id);

            return res.json({ message: "Professor eliminat correctament." });

        } catch (error) {
            console.error("Error al eliminar professor:", error);
            return res.status(500).json({ message: "Error en eliminar el professor." });
        }
    }
};

module.exports = professoratController;