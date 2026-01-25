// ======================================
// Importem les dependències
// ======================================

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================
// Definició de l'Esquema
// ======================================

// Controlador d'autenticació: Registre i login d'usuaris

// ======================================
// Declaracions de funcions
// ======================================

const authController = {
  // A) --- Registre: crea un nou usuari amb la contrasenya encriptada ---
  register: async (req, res) => {
    try {
      // 1. Obtenim les dades del cos de la petició
      const email = req.body.email;
      const password = req.body.password;
      const rol = req.body.rol;

      // 2. Comprovem si l'usuari ja existeix
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Aquest email ja està registrat." });
      }

      // 3. Definim el rol final: si no ve especificat, utilitzem 'CENTRE'
      let rolFinal = rol;
      if (!rolFinal) {
        rolFinal = "CENTRE";
      }

      // 4. Encriptem la contrasenya
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5. Creem l'usuari a la base de dades
      const newUser = await User.create({
        email: email,
        password: hashedPassword,
        rol: rolFinal
      });

      // 6. Retornem èxit
      res.status(201).json({ message: "Usuari registrat correctament", userId: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor al registrar l'usuari." });
    }
  },

  // B) --- Login: verifica credencials i retorna token ---
  login: async (req, res) => {
    try {
      // 1. Obtenim email i contrasenya del cos de la petició
      const email = req.body.email;
      const password = req.body.password;

      console.log(`[LOGIN DEBUG] Intent de login: ${email}`);

      // 2. Busquem l'usuari
      const user = await User.findByEmail(email);
      if (!user) {
        console.log(`[LOGIN DEBUG] Usuari no trobat a la BD: ${email}`);
        return res.status(401).json({ message: "Email o contrasenya incorrectes." });
      }
      console.log(`[LOGIN DEBUG] Usuari trobat ID: ${user.id}, Rol: ${user.rol}, PassHash: ${user.password.substring(0, 10)}...`);

      // 3. Comprovem la contrasenya (hash vs text pla)
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`[LOGIN DEBUG] Resultat comprovació password: ${isMatch}`);

      if (!isMatch) {
        return res.status(401).json({ message: "Email o contrasenya incorrectes." });
      }

      // 4. Generem el token JWT
      const token = jwt.sign(
        { id: user.id, rol: user.rol, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 5. Retornem el token i les dades de l'usuari
      res.json({
        message: "Login correcte",
        token: token,
        user: { id: user.id, email: user.email, rol: user.rol }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor durant el login." });
    }
  }
};

module.exports = authController;
