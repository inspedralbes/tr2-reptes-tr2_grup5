const Taller = require('../../models/Taller');
const Peticio = require('../../models/Peticio');
const Assistencia = require('../../models/Assistencia');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log("Iniciant càlcul d'estadístiques de logística realitzada...");

        // Executem les consultes en paral·lel
        const [centresStats, tallersStats, rankingReal, totalAbsolutAlumnes] = await Promise.all([
            Peticio.getCentresStats().catch(err => {
                console.error("Error a Peticio.getCentresStats:", err);
                return { total_centres: 0, total_alumnes: 0, media_alumnes: 0, trimestreTop: 'N/A' };
            }),
            Taller.getExtendedStats().catch(err => {
                console.error("Error a Taller.getExtendedStats:", err);
                return { mesSolicitats: [], sectorTop: 'N/A', modalitatTop: 'N/A' };
            }),
            Assistencia.getRankingAsistenciaCentres().catch(err => {
                console.error("Error a Assistencia.getRankingAsistenciaCentres:", err);
                return [];
            }),
            // NOVA CONSULTA: Comptatge total de files a la taula d'assistència
            Assistencia.getTotalAlumnesRegistrats().catch(err => {
                console.error("Error a Assistencia.getTotalAlumnesRegistrats:", err);
                return 0;
            })
        ]);

        // Càlcul d'alumnes que han marcat el check de "ha assistit"
        const totalAlumnesReals = rankingReal.reduce((acc, centre) => acc + (Number(centre.alumnes_reals) || 0), 0);

        res.json({
            success: true,
            data: {
                centres: {
                    solicitants: rankingReal.length || centresStats?.total_centres || 0,
                    
                    // AQUEST ÉS EL COUNT TOTAL que demanaves (tots els registres de la taula)
                    totalAlumnes: totalAbsolutAlumnes, 
                    
                    // Alumnes amb el check d'assistència marcat
                    totalAlumnesConfirmats: totalAlumnesReals,

                    mediaAlumnes: centresStats?.media_alumnes ? Number(centresStats.media_alumnes).toFixed(1) : "0.0",
                    ranking: rankingReal || []
                },
                tallers: {
                    mesSolicitats: tallersStats?.mesSolicitats || [],
                    sectorTop: tallersStats?.sectorTop || 'N/A',
                    modalitatTop: tallersStats?.modalitatTop || 'N/A',
                    trimestreTop: centresStats?.trimestreTop || 'N/A',
                    abandonats: 0
                }
            }
        });

    } catch (error) {
        console.error("ERROR CRÍTIC al controlador d'estadístiques:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error al processar les dades",
            error: error.message 
        });
    }
};