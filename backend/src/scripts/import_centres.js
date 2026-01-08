const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
// Importem la teva configuració de base de dades existent
const db = require("../src/config/db");

/**
 * Script per importar centres educatius des del fitxer CSV oficial.
 * Utilitza la connexió centralitzada del projecte definida a config/db.js.
 */

async function importCentres() {
  console.log("🚀 Iniciant processament del CSV de centres...");

  // El fitxer es troba a l'arrel del projecte (dos nivells amunt de backend/scripts)
  const csvFilePath = path.join(
    __dirname,
    "../../totcat-centres-educatius.csv"
  );

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Fitxer no trobat a: ${csvFilePath}`);
    process.exit(1);
  }

  const results = [];

  // Iniciem la lectura seqüencial del CSV
  fs.createReadStream(csvFilePath)
    .pipe(csv({ separator: ";" })) // Delimitador punt i coma oficial del fitxer
    .on("data", (data) => results.push(data))
    .on("error", (err) => console.error("❌ Error de lectura:", err))
    .on("end", async () => {
      console.log(`✅ CSV llegit. Processant ${results.length} files...`);

      let comptador = 0;
      let errors = 0;

      for (const row of results) {
        try {
          // Mapeig exacte basat en les capçaleres del teu CSV i la teva taula
          const dades = {
            user_id: null,
            codi_centre: row["Codi_centre"],
            nom_centre: row["Denominació_completa"],
            adreca: row["Adreça"],
            municipi: row["Nom_municipi"],
            telefon: row["Telèfon"],
            email_oficial: row["E-mail_centre"],
            nom_coordinador: null,
            es_primera_vegada: 0,
          };

          // Ignorem files buides o sense dades mínimes
          if (!dades.codi_centre || !dades.nom_centre) continue;

          // SQL amb ON DUPLICATE KEY UPDATE per evitar errors si el centre ja existeix
          const sql = `
            INSERT INTO centres 
            (user_id, codi_centre, nom_centre, adreca, municipi, telefon, email_oficial, nom_coordinador, es_primera_vegada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              nom_centre = VALUES(nom_centre),
              adreca = VALUES(adreca),
              municipi = VALUES(municipi),
              telefon = VALUES(telefon),
              email_oficial = VALUES(email_oficial)
          `;

          // Utilitzem 'db.execute' (el teu objecte importat)
          await db.execute(sql, [
            dades.user_id,
            dades.codi_centre,
            dades.nom_centre,
            dades.adreca,
            dades.municipi,
            dades.telefon,
            dades.email_oficial,
            dades.nom_coordinador,
            dades.es_primera_vegada,
          ]);

          comptador++;
          if (comptador % 500 === 0) {
            console.log(`⏳ Progrés: ${comptador} centres processats...`);
          }
        } catch (err) {
          errors++;
          console.error(
            `⚠️ Error al codi ${row["Codi_centre"] || "desconegut"}:`,
            err.message
          );
        }
      }

      console.log("\n--- Resum Final ---");
      console.log(`✅ Total importats/actualitzats: ${comptador}`);
      console.log(`❌ Total errors: ${errors}`);
    });
}

// Executem la funció
importCentres().catch((err) => {
  console.error("🔥 Error crític:", err.message);
  process.exit(1);
});
