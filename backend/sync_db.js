const db = require('./src/config/db');

async function main() {
    console.log("Comprovant db...");
    try {
        await db.query(`
            ALTER TABLE assistencia_alumnes 
            ADD COLUMN IF NOT EXISTS nota_tecnica DECIMAL(4,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS nota_actitud INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS ha_avaluat TINYINT(1) DEFAULT 0
        `);
        console.log("✅ Taula assistencia_alumnes actualitzada amb columnes d'evaluació.");
    } catch (err) {
        // En cas que l'usuari estigui en una versió de MariaDB/MySQL antiga que no suporti IF NOT EXISTS en ADD COLUMN
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ Les columnes ja existien.");
        } else {
            console.error("❌ Error actualitzant la taula:", err.message);
        }
    }
    process.exit(0);
}

main();
