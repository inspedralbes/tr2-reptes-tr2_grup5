//--- DECLAREM ELS MÒDULS NECESSARIS ---
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//--- IMPORTEM LES RUTES DE TALLERS ---
const tallersRoutes = require("./routes/tallersRoutes");

//--- CONFIGUREM L'APLICACIÓ EXPRESS ---
const app = express();
const PORT = process.env.PORT || 1700;

app.use(cors());
app.use(express.json());

//--- LI DIEM A LA APP QUE UTILITZI LES RUTES DE TALLERS ---
app.use("/api/tallers", tallersRoutes);

//--- RUTA ARREL PER COMPROVAR QUE L'API FUNCIONA ---
app.get("/", (req, res) => {
  res.send("API Backend del Projecte ENGINY funcionant 🚀");
});

//--- INICIEM EL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});
