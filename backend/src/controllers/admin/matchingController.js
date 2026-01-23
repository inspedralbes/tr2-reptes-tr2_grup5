const Matching = require("../../models/Matching");
const Log = require("../../models/Log");
const db = require("../../config/db");

const matchingController = {
    executeAutoAssignment: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per executar assignacions automàtiques." });
            }

            // Obtenir la cola de peticions pendents
            const queue = await Matching.getGlobalQueue();

            let successCount = 0;
            let rejectedCount = 0;
            const errors = [];

            // Recórrer cada petició de la cola
            for (let i = 0; i < queue.length; i++) {
                const detall = queue[i];
                
                try {
                    // 1. Validar places disponibles
                    const ocupat = await Matching.getOccupiedSpots(detall.taller_id, detall.trimestre);
                    const places_disponibles = detall.places_maximes - ocupat;

                    if (detall.num_participants > places_disponibles) {
                        // Marcar com a REBUTJADA per falta de places
                        await db.query(
                            "UPDATE peticio_detalls SET estat = 'REBUTJADA' WHERE id = ?",
                            [detall.detall_id]
                        );
                        rejectedCount++;
                        continue; // No hi ha places suficients, passar a la següent
                    }

                    // 2. Validar límit modalitat C (màxim 12 alumnes per centre per trimestre)
                    if (detall.modalitat === 'C') {
                        const totalModC = await Matching.getCentreCountModC(detall.centre_id, detall.trimestre);
                        if (totalModC + detall.num_participants > 12) {
                            // Marcar com a REBUTJADA per superar límit modalitat C
                            await db.query(
                                "UPDATE peticio_detalls SET estat = 'REBUTJADA' WHERE id = ?",
                                [detall.detall_id]
                            );
                            rejectedCount++;
                            continue; // Supera el límit de 12 alumnes en modalitat C
                        }
                    }

                    // 3. Realitzar l'assignació (transacció)
                    const connection = await db.getConnection();
                    try {
                        await connection.beginTransaction();

                        // Actualitzar estat a ASSIGNADA
                        await connection.query(
                            "UPDATE peticio_detalls SET estat = 'ASSIGNADA' WHERE id = ?",
                            [detall.detall_id]
                        );

                        // Actualitzar places al taller (dins de la transacció)
                        await connection.query(
                            "UPDATE tallers SET places_restants = places_restants - ? WHERE id = ?",
                            [detall.num_participants, detall.taller_id]
                        );

                        // 4. Assignar referent si és preferència referent (dins de la transacció)
                        if (detall.es_preferencia_referent == 1 && detall.docent_email) {
                            try {
                                // Comptar referents ja assignats per aquest taller en aquest trimestre
                                const [referentsCount] = await connection.query(`
                                    SELECT COUNT(DISTINCT ra.professor_id) as count
                                    FROM referents_assignats ra
                                    JOIN peticio_detalls pd ON ra.peticio_detall_id = pd.id
                                    WHERE pd.taller_id = ? AND pd.trimestre = ? AND pd.estat = 'ASSIGNADA'
                                `, [detall.taller_id, detall.trimestre]);

                                const numReferents = referentsCount[0].count || 0;

                                // Si ja hi ha 2 referents assignats, posar es_preferencia_referent a 0 i no assignar
                                if (numReferents >= 2) {
                                    await connection.query(
                                        "UPDATE peticio_detalls SET es_preferencia_referent = 0 WHERE id = ?",
                                        [detall.detall_id]
                                    );
                                    console.warn(`No s'assigna referent per ${detall.detall_id}: ja hi ha 2 referents assignats al taller ${detall.taller_id} en el trimestre ${detall.trimestre}`);
                                } else {
                                    // Buscar el professor per email
                                    const [prof] = await connection.query(`
                                        SELECT p.id 
                                        FROM professors p 
                                        JOIN usuaris u ON p.user_id = u.id 
                                        WHERE u.email = ?
                                    `, [detall.docent_email]);

                                    if (prof[0]) {
                                        // Inserir a referents_assignats (IGNORE per evitar duplicats)
                                        await connection.query(
                                            "INSERT IGNORE INTO referents_assignats (peticio_detall_id, professor_id) VALUES (?, ?)",
                                            [detall.detall_id, prof[0].id]
                                        );
                                    } else {
                                        console.warn(`No s'ha trobat cap professor amb l'email ${detall.docent_email} per al detall ${detall.detall_id}`);
                                    }
                                }
                            } catch (referentError) {
                                // No fem rollback si falla l'assignació del referent, només ho registrem
                                console.warn(`Error assignant referent per ${detall.detall_id}:`, referentError.message);
                            }
                        }

                        await connection.commit();
                        successCount++;

                        // Registrar a l'auditoria
                        await Log.create({
                            usuari_id: req.user.id,
                            accio: 'AUTO_ASSIGN_TALLER',
                            taula_afectada: 'peticio_detalls',
                            valor_nou: {
                                detall_id: detall.detall_id,
                                taller_id: detall.taller_id,
                                trimestre: detall.trimestre,
                                num_participants: detall.num_participants
                            }
                        });

                    } catch (transactionError) {
                        await connection.rollback();
                        throw transactionError;
                    } finally {
                        connection.release();
                    }

                } catch (error) {
                    // Si una assignació falla, continuem amb la següent
                    console.error(`Error processant detall ${detall.detall_id}:`, error);
                    errors.push({
                        detall_id: detall.detall_id,
                        error: error.message
                    });
                }
            }

            // Retornar resum del procés
            res.json({
                message: "Assignació automàtica completada",
                summary: {
                    success: successCount,
                    rejected: rejectedCount,
                    errors: errors.length,
                    total_processed: queue.length
                },
                errors: errors.length > 0 ? errors : undefined
            });

        } catch (error) {
            console.error("Error en l'assignació automàtica:", error);
            res.status(500).json({ message: "Error al servidor durant l'assignació automàtica." });
        }
    }
};

module.exports = matchingController;
