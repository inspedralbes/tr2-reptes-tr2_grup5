const Professor = require("../../models/Professor");
const Centre = require("../../models/Centre");

const professoratController = {
    getMeusProfessors: async (req, res) => {
        try {
            const user_id = req.user.id;

            const centre = await Centre.findByUserId(user_id);
            if (!centre) {
                return res.status(404).json({ message: "Centre no trobat per a aquest usuari." });
            }

            const professors = await Professor.getByCentreId(centre.id);
            res.json(professors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtenir els professors del centre." });
        }
    },

    
    createProf: async (req, res) => {
        try {
            const user_id_admin = req.user.id; 
            const { nom, cognoms, email } = req.body;

            
            const centre = await Centre.findByUserId(user_id_admin);
            if (!centre) {
                return res.status(404).json({ message: "Centre no trobat." });
            }

            
            const result = await Professor.create({ nom, cognoms, email, centre_id: centre.id });
            res.status(201).json({
                id: result.professorId, 
                nom,
                cognoms,
                email
            });
            res.status(201).json({
                id: result.professorId, 
                nom,
                cognoms,
                email,
                centre_id: centre.id
            });
        } catch (error) {
            console.error("Error al controlador professoratController:", error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    message: "Aquest correu electrònic ja està registrat en el sistema." 
                });
            }

            res.status(500).json({ message: "Error intern al crear el professor." });
        }
    }
};

module.exports = professoratController;