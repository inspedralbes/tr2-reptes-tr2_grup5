require('dotenv').config();
const mysql = require('mysql2/promise');

async function debug() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'tr2user',
        password: process.env.DB_PASSWORD || 'tr2pass',
        database: process.env.DB_NAME || 'enginy_db'
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log("--- COMPREHENSIVE PROFESSOR DEBUG ---");

        // 1. All users with role PROFESSOR
        const [users] = await connection.query("SELECT * FROM usuaris WHERE rol = 'PROFESSOR'");
        console.log("\nUsuaris (PROFESSOR):");
        console.table(users);

        // 2. All professor records
        const [profs] = await connection.query(`
            SELECT p.id as prof_id, p.user_id, p.centre_id, p.nom, p.cognoms, c.nom_centre 
            FROM professors p 
            JOIN centres c ON p.centre_id = c.id
        `);
        console.log("\nProfessors Table:");
        console.table(profs);

        // 3. Referent assignments
        const [refs] = await connection.query(`
            SELECT ra.peticio_detall_id, ra.professor_id, t.titol 
            FROM referents_assignats ra
            JOIN peticio_detalls pd ON ra.peticio_detall_id = pd.id
            JOIN tallers t ON pd.taller_id = t.id
        `);
        console.log("\nReferents Assignats:");
        console.table(refs);

        // 4. Find Robòtica Details
        const [robotica] = await connection.query("SELECT id FROM tallers WHERE titol LIKE '%Rob%'");
        if (robotica.length > 0) {
            const robId = robotica[0].id;
            const [detalls] = await connection.query("SELECT id, docent_email FROM peticio_detalls WHERE taller_id = ?", [robId]);
            console.log("\nRobòtica Details:");
            console.table(detalls);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

debug();
