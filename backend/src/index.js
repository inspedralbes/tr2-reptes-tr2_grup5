// ======================================
// Importem les dependències
// ======================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");

//--- IMPORTEM LES RUTES PER ROLS ---
const adminRoutes = require("./routes/adminRoutes");
const centreRoutes = require("./routes/centreRoutes");
const professorRoutes = require("./routes/professorRoutes");
const authRoutes = require("./routes/authRoutes");
const solicitudRegistreRoutes = require("./routes/solicitudRegistreRoutes");

const verifyToken = require("./middleware/authMiddleware");
const verifyRole = require("./middleware/roleMiddleware");

// ======================================
// Definició de l'Esquema
// ======================================

// Aplicació Express principal: Configuració del servidor i rutes de l'API

// ======================================
// Declaracions de funcions
// ======================================

// 1. Creem l'aplicació Express
const app = express();

// 2. Obtenim el port des de les variables d'entorn o utilitzem el port per defecte
let PORT = process.env.PORT;
if (!PORT) {
  PORT = 1700;
}

// 3. Configurem CORS per permetre peticions des de qualsevol origen
app.use(cors());

// 4. Configurem Express per processar JSON a les peticions
app.use(express.json());

// 5. Configurem les rutes d'autenticació
app.use("/api/auth", authRoutes);

// 6. Configurem les rutes d'administració amb verificació de token i rol
const rolesAdmin = ['ADMIN'];
app.use("/api/admin", verifyToken, verifyRole(rolesAdmin), adminRoutes);

// 7. Configurem les rutes de centres
app.use("/api/centre", centreRoutes);

// 8. Configurem les rutes de sol·licituds de registre
app.use("/api/solicituds-registre", solicitudRegistreRoutes);

// A) --- Ruta arrel per comprovar que l'API funciona ---
app.get("/", (req, res) => {
  // 1. Retornem un missatge de confirmació
  res.send("Backend grup 5 funcionant - Estructura per rols activa");
});

// A) --- Iniciem el servidor ---
app.listen(PORT, () => {
  // 1. Mostrem un missatge al console indicant que el servidor està escoltant
  console.log(`Servidor escoltant al port ${PORT}`);
});