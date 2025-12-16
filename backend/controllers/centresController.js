const db = require('../config/db');

// 1. GET: Obtenir tots els centres
const getAllCentres = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Centres');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllCentres};