require('dotenv').config();
const mysql = require('mysql2/promise');

async function fix() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'tr2user',
        password: process.env.DB_PASSWORD || 'tr2pass',
        database: process.env.DB_NAME || 'enginy_db'
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log("--- FIXING DATA FOR PROF ID 2 (Updated from logs) ---");

        // 1. Get Robòtica Details
        const [tallers] = await connection.query("SELECT * FROM tallers WHERE titol LIKE '%Rob%'");
        const roboticaId = tallers[0].id;

        const [detalls] = await connection.query("SELECT * FROM peticio_detalls WHERE taller_id = ?", [roboticaId]);

        if (detalls.length > 0) {
            const targetDetail = detalls[0].id;

            // 2. USE ID 2
            const profId = 2;

            // 3. Insert Referent Assignment if not exists
            const [check] = await connection.query("SELECT * FROM referents_assignats WHERE peticio_detall_id = ? AND professor_id = ?", [targetDetail, profId]);
            if (check.length === 0) {
                await connection.query("INSERT INTO referents_assignats (peticio_detall_id, professor_id) VALUES (?, ?)", [targetDetail, profId]);
                console.log(`SUCCESS: Assigned Professor ${profId} as Referent for Detail ${targetDetail} (Robòtica).`);
            } else {
                console.log(`Professor ${profId} is ALREADY a referent for Detail ${targetDetail}.`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

fix();
