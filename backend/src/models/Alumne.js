// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Alumne: Gestiona la taula 'assistencia_alumnes'

// ======================================
// Declaracions de funcions
// ======================================

const Alumne = {
    // A) --- Obtenir alumnes d'un taller assignat ---
    getByPeticioDetallId: async (peticioDetallId) => {
        // 1. Executem la consulta
        const result = await db.query(
            "SELECT * FROM assistencia_alumnes WHERE peticio_detall_id = ? ORDER BY cognoms, nom",
            [peticioDetallId]
        );
        
        // 2. Retornem les files
        const rows = result[0];
        return rows;
    },

    // A) --- Afegir un alumne individual ---
    create: async (peticioDetallId, nom, cognoms, email) => {
        // 1. Executem la inserció
        const result = await db.query(
            "INSERT INTO assistencia_alumnes (peticio_detall_id, nom, cognoms, email) VALUES (?, ?, ?, ?)",
            [peticioDetallId, nom, cognoms, email]
        );
        
        // 2. Obtenim l'ID
        const rows = result[0];
        const insertId = rows.insertId;
        
        // 3. Construïm l'objecte de resposta
        const alumneNou = {};
        alumneNou.id = insertId;
        alumneNou.peticio_detall_id = peticioDetallId;
        alumneNou.nom = nom;
        alumneNou.cognoms = cognoms;
        alumneNou.email = email;
        
        // 4. Retornem l'alumne
        return alumneNou;
    },

    // A) --- Afegir múltiples alumnes en transacció ---
    createMany: async (peticioDetallId, alumnes) => {
        // 1. Obtenim connexió
        const connection = await db.getConnection();
        
        try {
            // 2. Iniciem transacció
            await connection.beginTransaction();
            
            // 3. Recorrem l'array d'alumnes amb bucle clàssic
            for (let i = 0; i < alumnes.length; i++) {
                const alumne = alumnes[i];
                
                // 4. Preparem els valors evitant ternaris
                let nom = "";
                if (alumne.nom) nom = alumne.nom;
                
                let cognoms = "";
                if (alumne.cognoms) cognoms = alumne.cognoms;
                
                let email = "";
                if (alumne.email) email = alumne.email;
                
                let ha_assistit = 1;
                if (alumne.ha_assistit !== undefined) {
                    if (alumne.ha_assistit) {
                        ha_assistit = 1;
                    } else {
                        ha_assistit = 0;
                    }
                }

                // 5. Executem la inserció
                await connection.query(`
                    INSERT INTO assistencia_alumnes (peticio_detall_id, nom, cognoms, email, ha_assistit)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    peticioDetallId,
                    nom,
                    cognoms,
                    email,
                    ha_assistit
                ]);
            }
            
            // 6. Confirmem transacció
            await connection.commit();
            return true;
            
        } catch (error) {
            // 7. En cas d'error, desfem canvis
            await connection.rollback();
            throw error;
            
        } finally {
            // 8. Alliberem connexió
            connection.release();
        }
    },

    // A) --- Obtenir un alumne per ID ---
    getById: async (id) => {
        // 1. Executem la consulta
        const result = await db.query("SELECT * FROM assistencia_alumnes WHERE id = ?", [id]);
        
        // 2. Retornem la primera fila
        const rows = result[0];
        return rows[0];
    },

    // A) --- Eliminar un alumne ---
    delete: async (id) => {
        // 1. Executem l'eliminació
        const result = await db.query("DELETE FROM assistencia_alumnes WHERE id = ?", [id]);
        
        // 2. Verifiquem si s'ha eliminat
        const rows = result[0];
        if (rows.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    },

    // A) --- Comptar quants alumnes hi ha en un taller ---
    countByPeticioDetallId: async (peticioDetallId) => {
        // 1. Executem la consulta de recompte
        const result = await db.query(
            "SELECT COUNT(*) as exact_count FROM assistencia_alumnes WHERE peticio_detall_id = ?",
            [peticioDetallId]
        );
        
        // 2. Retornem el número
        const rows = result[0];
        return rows[0].exact_count;
    },

    // A) --- Actualitzar el comentari d'un alumne ---
    updateAvaluacio: async (id, comentaris) => {
        // 1. Executem l'actualització
        const result = await db.query(
            "UPDATE assistencia_alumnes SET comentarios = ? WHERE id = ?",
            [comentaris, id]
        );
        
        // 2. Verifiquem si s'ha actualitzat
        const rows = result[0];
        if (rows.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    }
};

module.exports = Alumne;
