const Alumne = require("../../models/Alumne");
const Taller = require("../../models/Taller");
const Log = require("../../models/Log");

// --- POST: Crear Alumne i/o Assignar a Taller ---
const createAlumne = async (req, res) => {
    const {
        idalu,
        nom,
        cognoms,
        centre_id,
        curs_actual,
        assignacio_taller_id
    } = req.body;

    // Validació bàsica
    if (!idalu || !nom || !centre_id || !assignacio_taller_id) {
        return res.status(400).json({ message: "Falten camps obligatoris (idalu, nom, centre_id, assignacio_taller_id)" });
    }

    try {
        // 1. Obtenir informació del Taller per saber la Modalitat
        const taller = await Taller.getByAssignacioId(assignacio_taller_id);
        if (!taller) {
            return res.status(404).json({ message: "L'assignació de taller especificada no existeix." });
        }

        // 2. LOGICA DE VALIDACIÓ: MODEL C (Màxim 12 alumnes per centre)
        if (taller.modalitat === 'C') {
            const totalAlumnesModelC = await Alumne.countByCentreAndModalitat(centre_id, 'C');

            // Comprovem primer si l'alumne ja existeix per IDALU
            const existingAlumne = await Alumne.findByIdalu(idalu);

            if (totalAlumnesModelC >= 12) {
                // Si hi ha 12 alumnes diferents fent Model C, no s'accepten més inscripcions a Model C per aquest centre 
                // llevat que l'alumne JA estigui a la llista (però com és create, assumim que estem afegint-ne un de nou o registrant).

                // Si l'alumne no existeix, és el 13è -> Error.
                if (!existingAlumne) {
                    return res.status(409).json({
                        message: "Límit assolit: Aquest centre ja té 12 alumnes en tallers de Model C."
                    });
                }

                // Si existeix, podríem deixar-lo passar si ja té assignacions 'C', però per seguretat i simplicitat,
                // si el cupo està ple, retornem error.
                return res.status(409).json({
                    message: "Límit assolit: Aquest centre ja té 12 alumnes en tallers de Model C."
                });
            }
        }

        // 3. Crear o Recuperar Alumne
        let alumneId;
        const existingAlumne = await Alumne.findByIdalu(idalu);

        if (existingAlumne) {
            alumneId = existingAlumne.id;
        } else {
            alumneId = await Alumne.create({ idalu, nom, cognoms, centre_id, curs_actual });
        }

        // 4. Assignar a Taller
        await Alumne.assignToGroup(alumneId, assignacio_taller_id);

        // AUDITORIA
        await Log.create({
            usuari_id: req.user ? req.user.id : null,
            accio: 'ASSIGN_ALUMNE',
            taula_afectada: 'assignacions_alumnes',
            valor_nou: { alumne_id: alumneId, assignacio_taller_id }
        });

        res.status(201).json({
            message: "Alumne creat/assignat correctament",
            alumne_id: alumneId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Aquest alumne ja està assignat a aquest taller." });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createAlumne };
