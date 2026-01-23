const Professor = require('../../models/Professor');

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

            console.log(`[DEBUG] Controller: Prof ${userEmail} (ID ${professor.id}) -> Referent Count: ${referentTallers.length}`);

            // 4. Fusionem llistes i calculem permisos
            const tallersMap = new Map();

            // Afegim els assignats (Docents)
            assignedTallers.forEach(t => {
                tallersMap.set(t.detall_id, {
                    ...t,
                    is_assigned: true,
                    is_referent: false
                });
            });

            // Afegim o actualitzem amb els referents
            referentTallers.forEach(t => {
                if (tallersMap.has(t.detall_id)) {
                    const existing = tallersMap.get(t.detall_id);
                    existing.is_referent = true; // Ara és ambdós
                } else {
                    tallersMap.set(t.detall_id, {
                        ...t,
                        is_assigned: false,
                        is_referent: true
                    });
                }
            });

            // Convertim a array i afegim l'objecte permissions
            const result = Array.from(tallersMap.values()).map(t => ({
                ...t,
                permissions: {
                    canManageList: t.is_assigned,       // Si és docent, fa la llista
                    canTakeAttendance: t.is_referent    // Si és referent, passa llista
                }
            }));

            res.json(result);
        } catch (error) {
            console.error('Error obtenint tallers assignats:', error);
            res.status(500).json({ message: 'Error al servidor obtenint els tallers.' });
        }
    }
};

module.exports = tallersController;
