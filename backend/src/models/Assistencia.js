// ======================================
// Importem les dependències
// ======================================

const db = require("../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Model Assistencia: Gestiona l'assistència dels alumnes

// ======================================
// Declaracions de funcions
// ======================================

const Assistencia = {
    // A) --- Guardar llista d'assistència ---
    saveList: async (peticio_detall_id, alumnes) => {
        // 1. Obtenim connexió
        const connection = await db.getConnection();
        
        try {
            // 2. Iniciem transacció
            await connection.beginTransaction();

            // 3. Netegem la llista prèvia
            await connection.query('DELETE FROM assistencia_alumnes WHERE peticio_detall_id = ?', [peticio_detall_id]);

            // 4. Recorrem i inserim els alumnes amb bucle clàssic
            for (let i = 0; i < alumnes.length; i++) {
                const alumne = alumnes[i];
                
                let ha_assistit_val = 0;
                if (alumne.ha_assistit) {
                    ha_assistit_val = 1;
                }

                await connection.query(`
                    INSERT INTO assistencia_alumnes (peticio_detall_id, nom, cognoms, email, ha_assistit)
                    VALUES (?, ?, ?, ?, ?)
                `, [peticio_detall_id, alumne.nom, alumne.cognoms, alumne.email, ha_assistit_val]);
            }

            // 5. Confirmem transacció
            await connection.commit();
            
            // 6. Retornem resultat
            const resultat = {};
            resultat.success = true;
            resultat.count = alumnes.length;
            return resultat;

        } catch (error) {
            // 7. En cas d'error, desfem
            await connection.rollback();
            throw error;
            
        } finally {
            // 8. Alliberem connexió
            connection.release();
        }
    },

    // A) --- Obtenir llista d'assistència per a una petició ---
    getByDetallId: async (peticio_detall_id) => {
        // 1. Executem la consulta
        const result = await db.query(`
            SELECT * FROM assistencia_alumnes 
            WHERE peticio_detall_id = ?
            ORDER BY cognoms, nom
        `, [peticio_detall_id]);
        
        // 2. Retornem les files
        const rows = result[0];
        return rows;
    },

    // A) --- Actualitzar estat d'assistència d'un alumne ---
    updateStatus: async (id, ha_assistit) => {
        // 1. Determinem el valor enter
        let val_assistit = 0;
        if (ha_assistit) {
            val_assistit = 1;
        }

        // 2. Executem l'actualització
        const result = await db.query(`
            UPDATE assistencia_alumnes
            SET ha_assistit = ?
            WHERE id = ?
        `, [val_assistit, id]);
        
        // 3. Retornem cert si s'ha actualitzat
        const rows = result[0];
        if (rows.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    },

    // A) --- Obtenir ranking de centres basat en assistència ---
    getRankingAsistenciaCentres: async () => {
        // 1. Executem la consulta complexa de ranking
        const result = await db.query(`
            SELECT 
                c.nom_centre,
                COUNT(DISTINCT pd.id) as total_tallers,
                SUM(pd.num_participants) as total_alumnes_planificats,
                (
                    SELECT COUNT(*) 
                    FROM assistencia_alumnes aa 
                    JOIN peticio_detalls pd2 ON aa.peticio_detall_id = pd2.id
                    JOIN peticions p2 ON pd2.peticio_id = p2.id
                    WHERE p2.centre_id = c.id AND aa.ha_assistit = 1
                ) as alumnes_reals,
                ROUND(
                    IFNULL(
                        ((SELECT COUNT(*) 
                          FROM assistencia_alumnes aa 
                          JOIN peticio_detalls pd2 ON aa.peticio_detall_id = pd2.id
                          JOIN peticions p2 ON pd2.peticio_id = p2.id
                          WHERE p2.centre_id = c.id AND aa.ha_assistit = 1) 
                        / NULLIF(SUM(pd.num_participants), 0)) * 100, 
                    0), 
                2) as percentatge_asistencia
            FROM centres c
            JOIN peticions p ON c.id = p.centre_id
            JOIN peticio_detalls pd ON p.id = pd.peticio_id
            WHERE pd.estat = 'ASSIGNADA'
            GROUP BY c.id, c.nom_centre
            ORDER BY percentatge_asistencia DESC
        `);
        
        // 2. Retornem les files
        const rows = result[0];
        return rows;
    },

    // A) --- Obtenir estadístiques de tallers per execució ---
    getStatsTallers: async () => {
        // 1. Executem la consulta d'estadístiques
        const result = await db.query(`
            SELECT 
                t.titol,
                t.sector,
                t.modalitat,
                COUNT(pd.id) as total_peticions,
                ROUND((COUNT(pd.id) / (SELECT COUNT(*) FROM peticio_detalls WHERE estat = 'ASSIGNADA')) * 100, 1) as percentatge_impacte
            FROM tallers t
            JOIN peticio_detalls pd ON t.id = pd.taller_id
            WHERE pd.estat = 'ASSIGNADA'
            GROUP BY t.id
            ORDER BY total_peticions DESC
            LIMIT 5
        `);
        
        // 2. Retornem les files
        const rows = result[0];
        return rows;
    },

    // A) --- Obtenir el total d'alumnes registrats ---
    getTotalAlumnesRegistrats: async () => {
        // 1. Executem el comptatge global
        const result = await db.query(`
            SELECT COUNT(*) as total 
            FROM assistencia_alumnes
        `);
        
        // 2. Retornem el valor
        const rows = result[0];
        if (rows[0].total) {
            return rows[0].total;
        } else {
            return 0;
        }
    }
};

module.exports = Assistencia;