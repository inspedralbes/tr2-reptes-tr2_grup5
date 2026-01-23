require('dotenv').config();
const mysql = require('mysql2/promise');

async function debug() {
    const searchTerm = process.argv[2] || "Rob";

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'tr2user',
        password: process.env.DB_PASSWORD || 'tr2pass',
        database: process.env.DB_NAME || 'enginy_db'
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log(`--- INVESTIGANDO TALLER: "${searchTerm}" ---`);

        // 1. Buscar el Taller
        const [tallers] = await connection.query("SELECT * FROM tallers WHERE titol LIKE ?", [`%${searchTerm}%`]);
        if (tallers.length === 0) {
            console.log(`No se encontró ningún taller con el nombre: "${searchTerm}"`);
            return;
        }

        for (const taller of tallers) {
            console.log(`\n--- Taller ID ${taller.id}: ${taller.titol} ---`);

            // 2. Buscar Peticiones
            const [detalls] = await connection.query("SELECT * FROM peticio_detalls WHERE taller_id = ?", [taller.id]);
            console.log(`- Grupos (${detalls.length}):`);

            for (const d of detalls) {
                console.log(`  > ID ${d.id}: Docente ${d.docent_email} | Pref. Ref: ${d.es_preferencia_referent} | Estado: ${d.estat}`);

                // 3. Referentes
                const [refs] = await connection.query(`
                    SELECT ra.*, u.email 
                    FROM referents_assignats ra
                    JOIN professors p ON ra.professor_id = p.id
                    JOIN usuaris u ON p.user_id = u.id
                    WHERE ra.peticio_detall_id = ?
                `, [d.id]);

                if (refs.length > 0) {
                    refs.forEach(r => console.log(`      * Referente: ${r.email} (ID ${r.professor_id})`));
                }
            }
        }

        // 4. Profesores
        const [profs] = await connection.query(`
            SELECT p.id, u.email FROM professors p JOIN usuaris u ON p.user_id = u.id
        `);
        console.log("\n--- PROFESORES ---");
        profs.forEach(p => console.log(`ID ${p.id}: ${p.email}`));

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

debug();
