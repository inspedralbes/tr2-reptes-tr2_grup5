require('dotenv').config();
const express = require('express');
const cors = require('cors');

//Importem les rutes definides en centresRoutes.js
const centresRoutes = require('./routes/centresRoutes');

const app = express();
const PORT = process.env.PORT || 1700;

app.use(cors());
app.use(express.json());

// Utilitzar les rutes
app.use('/api/centres', centresRoutes);

// Ruta de prova
app.get('/', (req, res) => {
    res.send('API Backend funcionando 🚀');
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});