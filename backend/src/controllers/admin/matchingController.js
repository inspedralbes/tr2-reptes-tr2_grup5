// ======================================
// Importem les dependències
// ======================================

const Matching = require("../../models/Matching");
const Log = require("../../models/Log");
const db = require("../../config/db");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de matching (admin): Assignació automàtica de tallers

// ======================================
// Declaracions de funcions
// ======================================

const matchingController = {
  // A) --- Executar l'assignació automàtica de tallers ---
  executeAutoAssignment: async (req, res) => {
        try {
            if (req.user.rol !== 'ADMIN') {
                return res.status(403).json({ message: "No tens permisos per executar assignacions automàtiques." });
            }

            // 1. Obtenir la cola de peticions pendents
            const queue = await Matching.getGlobalQueue();

            let successCount = 0;
            let rejectedCount = 0;
            const errors = [];

            // 2. Recórrer cada petició de la cola
            for (let i = 0; i < queue.length; i++) {
                const detall = queue[i];
                
                try {
                    // 3. Validar places disponibles
                    const ocupat = await Matching.getOccupiedSpots(detall.taller_id, detall.trimestre);
                    const places_disponibles = detall.places_maximes - ocupat;

                    if (detall.num_participants > places_disponibles) {
                        await db.query(
                            "UPDATE peticio_detalls SET estat = 'REBUTJADA' WHERE id = ?",
                            [detall.detall_id]
                        );
                        rejectedCount++;
                        const txtAnterior = "Detall petició id " + detall.detall_id + ", taller id " + detall.taller_id + ", trimestre '" + detall.trimestre + "', estat PENDENT.";
                        const txtNou = "Rebutjada per assignació automàtica: manquen places (detall id " + detall.detall_id + ", taller id " + detall.taller_id + ", demanats " + detall.num_participants + ", disponibles " + places_disponibles + ").";
                        try {
                            await Log.create({
                                usuari_id: req.user.id,
                                accio: 'AUTO_REJECT_TALLER',
                                taula_afectada: 'peticio_detalls',
                                valor_anterior: txtAnterior,
                                valor_nou: txtNou
                            });
                        } catch (logErr) {
                            console.error("Error creant log d'auditoria:", logErr.message);
                        }
                        continue;
                    }

                    // 4. Validar límit modalitat C (màxim 12 alumnes per centre per trimestre)
                    if (detall.modalitat === 'C') {
                        const totalModC = await Matching.getCentreCountModC(detall.centre_id, detall.trimestre);
                        if (totalModC + detall.num_participants > 12) {
                            await db.query(
                                "UPDATE peticio_detalls SET estat = 'REBUTJADA' WHERE id = ?",
                                [detall.detall_id]
                            );
                            rejectedCount++;
                            const txtAnterior = "Detall petició id " + detall.detall_id + ", taller id " + detall.taller_id + ", trimestre '" + detall.trimestre + "', modalitat C, estat PENDENT.";
                            const txtNou = "Rebutjada per assignació automàtica: límit de 12 alumnes en modalitat C superat (detall id " + detall.detall_id + ", centre id " + detall.centre_id + ", trimestre " + detall.trimestre + ").";
                            try {
                                await Log.create({
                                    usuari_id: req.user.id,
                                    accio: 'AUTO_REJECT_TALLER',
                                    taula_afectada: 'peticio_detalls',
                                    valor_anterior: txtAnterior,
                                    valor_nou: txtNou
                                });
                            } catch (logErr) {
                                console.error("Error creant log d'auditoria:", logErr.message);
                            }
                            continue;
                        }
                    }

                    // 5. Realitzar l'assignació (transacció)
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

                        // 6. Assignar referent si és preferència referent (dins de la transacció)
                        if (detall.es_preferencia_referent == 1 && detall.docent_email) {
                            try {
                                // Comptar referents ja assignats per aquest taller en aquest trimestre
                                const resReferents = await connection.query(`
                                    SELECT COUNT(DISTINCT ra.professor_id) as count
                                    FROM referents_assignats ra
                                    JOIN peticio_detalls pd ON ra.peticio_detall_id = pd.id
                                    WHERE pd.taller_id = ? AND pd.trimestre = ? AND pd.estat = 'ASSIGNADA'
                                `, [detall.taller_id, detall.trimestre]);
                                const rowsReferents = resReferents[0];
                                let numReferents = 0;
                                if (rowsReferents[0] && rowsReferents[0].count !== undefined) {
                                  numReferents = rowsReferents[0].count;
                                }

                                // Si ja hi ha 2 referents assignats, posar es_preferencia_referent a 0 i no assignar
                                if (numReferents >= 2) {
                                    await connection.query(
                                        "UPDATE peticio_detalls SET es_preferencia_referent = 0 WHERE id = ?",
                                        [detall.detall_id]
                                    );
                                    console.warn(`No s'assigna referent per ${detall.detall_id}: ja hi ha 2 referents assignats al taller ${detall.taller_id} en el trimestre ${detall.trimestre}`);
                                } else {
                                    // Buscar el professor per email
                                    const resProf = await connection.query(`
                                        SELECT p.id 
                                        FROM professors p 
                                        JOIN usuaris u ON p.user_id = u.id 
                                        WHERE u.email = ?
                                    `, [detall.docent_email]);
                                    const rowsProf = resProf[0];

                                    if (rowsProf[0]) {
                                        // Inserir a referents_assignats (IGNORE per evitar duplicats)
                                        await connection.query(
                                            "INSERT IGNORE INTO referents_assignats (peticio_detall_id, professor_id) VALUES (?, ?)",
                                            [detall.detall_id, rowsProf[0].id]
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
                        const txtAnterior = "Detall petició id " + detall.detall_id + ", taller id " + detall.taller_id + ", trimestre '" + detall.trimestre + "', estat PENDENT, abans d'assignació automàtica.";
                        const txtNou = "Assignat automàticament el taller id " + detall.taller_id + " (trimestre " + detall.trimestre + ", " + detall.num_participants + " participants) al detall id " + detall.detall_id + ".";
                        try {
                            await Log.create({
                                usuari_id: req.user.id,
                                accio: 'AUTO_ASSIGN_TALLER',
                                taula_afectada: 'peticio_detalls',
                                valor_anterior: txtAnterior,
                                valor_nou: txtNou
                            });
                        } catch (logErr) {
                            console.error("Error creant log d'auditoria:", logErr.message);
                        }

                    } catch (transactionError) {
                        await connection.rollback();
                        throw transactionError;
                    } finally {
                        connection.release();
                    }

                } catch (error) {
                    // Si una assignació falla, continuem amb la següent
                    console.error(`Error processant detall ${detall.detall_id}:`, error);
                    const errorObj = {};
                    errorObj.detall_id = detall.detall_id;
                    errorObj.error = error.message;
                    errors.push(errorObj);
                }
            }

            // 7. Retornar resum del procés
            let errorsProp;
            if (errors.length > 0) {
              errorsProp = errors;
            } else {
              errorsProp = undefined;
            }
            
            const summary = {};
            summary.success = successCount;
            summary.rejected = rejectedCount;
            summary.errors = errors.length;
            summary.total_processed = queue.length;

            res.json({
              message: "Assignació automàtica completada",
              summary: summary,
              errors: errorsProp
            });

        } catch (error) {
            console.error("Error en l'assignació automàtica:", error);
            res.status(500).json({ message: "Error al servidor durant l'assignació automàtica." });
        }
    }
};

module.exports = matchingController;
