const Taller = require('../../models/Taller');
const Peticio = require('../../models/Peticio');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log("Iniciant càlcul d'estadístiques de logística realitzada...");

        // Executem les 3 consultes en paral·lel per eficiència
        // Recorda: Ara els models ja filtren internament per estat = 'ASSIGNADA'
        const [centresStats, tallersStats, rankingCentres] = await Promise.all([
            Peticio.getCentresStats().catch(err => {
                console.error("Error detallat a Peticio.getCentresStats:", err);
                return { total_centres: 0, total_alumnes: 0, media_alumnes: 0, trimestreTop: 'N/A' };
            }),
            Taller.getExtendedStats().catch(err => {
                console.error("Error detallat a Taller.getExtendedStats:", err);
                return { mesSolicitats: [], sectorTop: 'N/A', modalitatTop: 'N/A' };
            }),
            Peticio.getCentresPrioritatRanking().catch(err => {
                console.error("Error detallat a Peticio.getCentresPrioritatRanking:", err);
                return [];
            })
        ]);

        // Estructura de resposta unificada per al Frontend
        res.json({
            success: true,
            data: {
                centres: {
                    // Centres que tenen com a mínim un taller realment assignat
                    solicitants: centresStats?.total_centres || 0,
                    // Suma d'alumnes dels tallers confirmats
                    totalAlumnes: centresStats?.total_alumnes || 0,
                    // Mitjana d'alumnes per taller assignat
                    mediaAlumnes: centresStats?.media_alumnes ? Number(centresStats.media_alumnes).toFixed(1) : "0.0",
                    // Llista dels 5 centres amb més activitat confirmada
                    ranking: rankingCentres || []
                },
                tallers: {
                    // Top 5 tallers confirmats
                    mesSolicitats: tallersStats?.mesSolicitats || [],
                    // Sector amb més èxit d'assignació
                    sectorTop: tallersStats?.sectorTop || 'N/A',
                    // Modalitat amb més èxit d'assignació
                    modalitatTop: tallersStats?.modalitatTop || 'N/A',
                    // El trimestre amb més volum de feina confirmada
                    trimestreTop: centresStats?.trimestreTop || 'N/A',
                    // Mètrica estàtica o opcional
                    abandonats: 0
                }
            }
        });

    } catch (error) {
        console.error("ERROR CRÍTIC al controlador d'estadístiques:", error);
        
        res.status(500).json({ 
            success: false, 
            message: "S'ha produït un error inesperat al processar les dades de logística",
            error: error.message 
        });
    }
};