const db = require("../config/db");

const referentService = {
    // Buscar professor per email i vincular-lo com a referent
    assignReferent: async (peticio_detall_id, docent_email) => {
        if (!docent_email) {
            return { success: false, message: "No s'ha proporcionat email del docent" };
        }

        try {
            // Buscar el professor per email
            const [prof] = await db.query(`
                SELECT p.id 
                FROM professors p 
                JOIN usuaris u ON p.user_id = u.id 
                WHERE u.email = ?
            `, [docent_email]);

            if (!prof[0]) {
                return { success: false, message: `No s'ha trobat cap professor amb l'email ${docent_email}` };
            }

            const professor_id = prof[0].id;

            // Inserir a referents_assignats (IGNORE per evitar duplicats)
            await db.query(
                "INSERT IGNORE INTO referents_assignats (peticio_detall_id, professor_id) VALUES (?, ?)",
                [peticio_detall_id, professor_id]
            );

            return { success: true, professor_id };
        } catch (error) {
            console.error("Error assignant referent:", error);
            return { success: false, message: error.message };
        }
    }
};

module.exports = referentService;
