require('dotenv').config();
const mysql = require('mysql2/promise');

async function debug() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'tr2user',
        password: process.env.DB_PASSWORD || 'tr2pass',
        database: process.env.DB_NAME || 'enginy_db'
    };

    console.log("Connecting to:", config.host);
    const connection = await mysql.createConnection(config);

    try {
        // 1. DUMP ALL PROFS WITH EMAIL
        const [profs] = await connection.query(`
            SELECT p.id, p.nom, p.cognoms, u.email 
            FROM professors p 
            JOIN usuaris u ON p.user_id = u.id
        `);
        console.log("--- Teachers & Emails ---");
        profs.forEach(p => console.log(`ID ${p.id}: ${p.nom} ${p.cognoms} (${p.email})`));

        // 2. Find Tallers with "Rob" in title
        const [tallers] = await connection.query("SELECT * FROM tallers");
        console.log("\n--- Tallers with 'Rob' ---");
        const robotica = tallers.filter(t => t.titol && t.titol.toLowerCase().includes('rob'));
        console.log(JSON.stringify(robotica, null, 2));

        if (robotica.length === 0) {
            console.log("No workshops found with 'rob' in title.");
        } else {
            const tallerIds = robotica.map(t => t.id);

            // 3. Find Peticio Detalls
            const placeholders = tallerIds.map(() => '?').join(',');
            const [detalls] = await connection.query(`
                SELECT pd.id, pd.taller_id, pd.estat, pd.docent_email 
                FROM peticio_detalls pd 
                WHERE pd.taller_id IN (${placeholders})
            `, tallerIds);

            console.log("\n--- Petitions (Details) for Robòtica ---");
            console.log(JSON.stringify(detalls, null, 2));

            // 4. Find Referents
            if (detalls.length > 0) {
                const detallIds = detalls.map(d => d.id);
                const ph2 = detallIds.map(() => '?').join(',');
                const [refs] = await connection.query(`
                    SELECT * FROM referents_assignats WHERE peticio_detall_id IN (${ph2})
                `, detallIds);
                console.log("\n--- Referents Assigned to these Petitions ---");
                console.log(JSON.stringify(refs, null, 2));
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

debug();
