// ======================================
// Importem les dependències
// ======================================

const Professor = require('../../models/Professor');

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador de tallers (professors): Llistat de tallers assignats

// ======================================
// Declaracions de funcions
// ======================================

const tallersController = {
    getTallersAssignats: async (req, res) => {
        try {
            const userEmail = req.user.email;
            const userId = req.user.id;

            // 1. Obtenim l'ID de professor associat a l'usuari
            const professor = await Professor.getByUserId(userId);
            if (!professor) {
                return res.status(404).json({ message: "Professor no trobat." });
            }

            // 2. Obtenim tallers on és docent (ASSIGNED)
            const assignedTallers = await Professor.getAssignedTallers(userEmail);

            // 3. Obtenim tallers on és referent (REFERENT)
            const referentTallers = await Professor.getReferentTallers(professor.id, userEmail);

            // 4. Fusionem llistes i calculem permisos
            const tallersMap = new Map();

            // Afegim els assignats (Docents) - Bucle clàssic
            for (let i=0; i < assignedTallers.length; i++) {
                const t = assignedTallers[i];
                // Creem una còpia explicita
                const tCopy = {};
                for (const k in t) {
                    tCopy[k] = t[k];
                }
                tCopy.is_assigned = true;
                tCopy.is_referent = false;
                tallersMap.set(t.detall_id, tCopy);
            }

            // Afegim o actualitzem amb els referents - Bucle clàssic
            for (let i=0; i < referentTallers.length; i++) {
                const t = referentTallers[i];
                if (tallersMap.has(t.detall_id)) {
                    const existing = tallersMap.get(t.detall_id);
                    existing.is_referent = true; // Ara és ambdós
                } else {
                    const tCopy = {};
                    for (const k in t) {
                        tCopy[k] = t[k];
                    }
                    tCopy.is_assigned = false;
                    tCopy.is_referent = true;
                    tallersMap.set(t.detall_id, tCopy);
                }
            }

            // Convertim a array i afegim l'objecte permissions - Sense .map(), utilitzem bucle
            const result = [];
            
            // Iterem sobre els valors del Map
            const iterator = tallersMap.values();
            let step = iterator.next();
            
            while (!step.done) {
                const t = step.value;
                const tFinal = {};
                // Copiar tot
                for (const k in t) {
                    tFinal[k] = t[k];
                }
                // Afegir permissions
                const perms = {};
                perms.canManageList = t.is_assigned;
                perms.canTakeAttendance = t.is_referent;
                tFinal.permissions = perms;
                
                result.push(tFinal);
                step = iterator.next();
            }

            res.json(result);
        } catch (error) {
            console.error('Error obtenint tallers assignats:', error);
            res.status(500).json({ message: 'Error al servidor obtenint els tallers.' });
        }
    }
};

module.exports = tallersController;
