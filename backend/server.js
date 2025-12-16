const express = require('express');
const app = express();
const port = 1700;

app.get('/', (req, res) => {
    res.send('¡Backend funcionando con Node y Express!');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});