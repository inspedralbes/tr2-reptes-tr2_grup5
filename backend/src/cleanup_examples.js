require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanup() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'tr2user',
        password: process.env.DB_PASSWORD || 'tr2pass',
        database: process.env.DB_NAME || 'enginy_db'
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log("--- CLEANING UP EXAMPLE DATA (IDs 1 & 2) ---");

        // Delete from peticio_detalls (Cascades will hit referents_assignats, sessions, etc. if FK set correctly)
        // IDs 1 and 2 are the "blank" ones from the user's screenshot.
        const [result] = await connection.query("DELETE FROM peticio_detalls WHERE id IN (1, 2)");
        console.log(`Deleted ${result.affectedRows} example records.`);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

cleanup();
