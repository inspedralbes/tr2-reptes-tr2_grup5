// ======================================
// Importem les dependències
// ======================================

const dotenv = require("dotenv");
dotenv.config();

const mysql = require("mysql2/promise");

// ======================================
// Definició de l'Esquema
// ======================================

// Configuració del pool de connexions a MySQL

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Crear el pool de connexions ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: "utf8mb4",
});

module.exports = pool;
