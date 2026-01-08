const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // REGISTRE: Crea un nou usuari amb la contrasenya encriptada
    register: async (req, res) => {
        try {
            const { email, password, rol } = req.body;

            // 1. Comprovem si l'usuari ja existeix
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Aquest email ja està registrat.' });
            }

            // 2. Encriptem la contrasenya
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Creem l'usuari a la BBDD
            const newUser = await User.create({
                email,
                password: hashedPassword,
                rol: rol || 'CENTRE' // Rol per defecte si no s'especifica
            });

            res.status(201).json({ message: 'Usuari registrat correctament', userId: newUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor al registrar l\'usuari.' });
        }
    },

    // LOGIN: Verifica credencials
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Busquem l'usuari
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Email o contrasenya incorrectes.' });
            }

            // 2. Comprovem la contrasenya (hash vs text pla)
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email o contrasenya incorrectes.' });
            }

            // 3. Generem i retornem un token (preparant per quan s'activi JWT)
            // Nota: Si encara no vols fer servir el token, pots ignorar-lo al frontend,
            // però el generem per tenir-ho llest.
            const token = jwt.sign(
                { id: user.id, rol: user.rol, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                message: 'Login correcte',
                token,
                user: { id: user.id, email: user.email, rol: user.rol }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor durant el login.' });
        }
    }
};

module.exports = authController;
