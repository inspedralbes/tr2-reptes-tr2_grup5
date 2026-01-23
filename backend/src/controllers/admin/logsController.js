const Log = require("../../models/Log");

const logsController = {
    getAll: async (req, res) => {
        try {
            const logs = await Log.getAll();
            res.json(logs);
        } catch (error) {
            res.status(500).json({ message: "Error obtenint logs d'auditoria" });
        }
    }
};

module.exports = logsController;