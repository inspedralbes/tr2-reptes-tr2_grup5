const Professor = require('../../models/Professor');

const tallersController = {
    getTallersAssignats: async (req, res) => {
        try {
            const userEmail = req.user.email; // Email des del token

            // 3. Obtenir els tallers assignats directament per l'email (coincidint amb peticio_detalls.docent_email)
            const tallers = await Professor.getAssignedTallers(userEmail);

            res.json(tallers);
        } catch (error) {
            console.error('Error obtenint tallers assignats:', error);
            res.status(500).json({ message: 'Error al servidor obtenint els tallers.' });
        }
    }
};

module.exports = tallersController;
