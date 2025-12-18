//--- DECLAREM ELS MÒDULS NECESSARIS ---
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//--- IMPORTEM LES RUTES PER ROLS ---
const adminRoutes = require("./routes/adminRoutes");
const centreRoutes = require("./routes/centreRoutes");

//--- CONFIGUREM L'APLICACIÓ EXPRESS ---
const app = express();
const PORT = process.env.PORT || 1700;

app.use(cors());
app.use(express.json());

//--- RUTES PRINCIPALS ---
app.use("/api/admin", adminRoutes);
app.use("/api/centre", centreRoutes);

//--- RUTA ARREL PER COMPROVAR QUE L'API FUNCIONA ---
app.get("/", (req, res) => {
  res.send("Backend grup 5 funcionant - Estructura per rols activa");
});

//--- INICIEM EL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});