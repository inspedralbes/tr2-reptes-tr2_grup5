const Professor = require("../../models/Professor");
const Centre = require("../../models/Centre");

const professoratController = {
    // Obtenir tots els professors del centre de l'usuari loguejat
    getMeusProfessors: async (req, res) => {
        try {
            const user_id = req.user.id;

            // 1. Trobar el centre de l'usuari
            const centre = await Centre.findByUserId(user_id);
            if (!centre) {
                return res.status(404).json({ message: "Centre no trobat per a aquest usuari." });
            }

            // 2. Obtenir els professors d'aquest centre
            const professors = await Professor.getByCentreId(centre.id);

            res.json(professors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtenir els professors del centre." });
        }
    }
};

module.exports = professoratController;
