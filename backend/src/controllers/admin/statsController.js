// ======================================
// Importem les dependències
// ======================================

const Taller = require("../../models/Taller");
const Peticio = require("../../models/Peticio");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador d'estadístiques (admin): Dades del dashboard de logística

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir les estadístiques del dashboard ---
const getDashboardStats = async (req, res) => {
  try {
    // 1. Executem les tres consultes en paral·lel
    const results = await Promise.all([
      Peticio.getCentresStats().catch(function (err) {
        console.error("Error detallat a Peticio.getCentresStats:", err);
        return { total_centres: 0, total_alumnes: 0, media_alumnes: 0, trimestreTop: "N/A" };
      }),
      Taller.getExtendedStats().catch(function (err) {
        console.error("Error detallat a Taller.getExtendedStats:", err);
        return { mesSolicitats: [], sectorTop: "N/A", modalitatTop: "N/A" };
      }),
      Peticio.getCentresPrioritatRanking().catch(function (err) {
        console.error("Error detallat a Peticio.getCentresPrioritatRanking:", err);
        return [];
      })
    ]);

    const centresStats = results[0];
    const tallersStats = results[1];
    const rankingCentres = results[2];

    // 2. Construïm els valors per a centres (evitant ternaris i optional chaining)
    let solicitants = 0;
    if (centresStats && centresStats.total_centres !== undefined && centresStats.total_centres !== null) {
      solicitants = centresStats.total_centres;
    }

    let totalAlumnes = 0;
    if (centresStats && centresStats.total_alumnes !== undefined && centresStats.total_alumnes !== null) {
      totalAlumnes = centresStats.total_alumnes;
    }

    let mediaAlumnes = "0.0";
    if (centresStats && centresStats.media_alumnes !== undefined && centresStats.media_alumnes !== null) {
      mediaAlumnes = Number(centresStats.media_alumnes).toFixed(1);
    }

    let ranking = [];
    if (rankingCentres && Array.isArray(rankingCentres)) {
      ranking = rankingCentres;
    }

    // 3. Construïm els valors per a tallers
    let mesSolicitats = [];
    if (tallersStats && tallersStats.mesSolicitats && Array.isArray(tallersStats.mesSolicitats)) {
      mesSolicitats = tallersStats.mesSolicitats;
    }

    let sectorTop = "N/A";
    if (tallersStats && tallersStats.sectorTop) {
      sectorTop = tallersStats.sectorTop;
    }

    let modalitatTop = "N/A";
    if (tallersStats && tallersStats.modalitatTop) {
      modalitatTop = tallersStats.modalitatTop;
    }

    let trimestreTop = "N/A";
    if (centresStats && centresStats.trimestreTop) {
      trimestreTop = centresStats.trimestreTop;
    }

    // 4. Muntem la resposta
    res.json({
      success: true,
      data: {
        centres: {
          solicitants: solicitants,
          totalAlumnes: totalAlumnes,
          mediaAlumnes: mediaAlumnes,
          ranking: ranking
        },
        tallers: {
          mesSolicitats: mesSolicitats,
          sectorTop: sectorTop,
          modalitatTop: modalitatTop,
          trimestreTop: trimestreTop,
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

module.exports = {
  getDashboardStats
};
