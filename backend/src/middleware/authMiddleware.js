// ======================================
// Importem les dependències
// ======================================

const jwt = require('jsonwebtoken');

// ======================================
// Definició de l'Esquema
// ======================================

// Middleware d'autenticació: Verifica el token JWT de les peticions

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Verificar el token JWT de la petició ---
const verifyToken = (req, res, next) => {
    // 1. Llegim la capçalera 'Authorization' de la petició
    const tokenHeader = req.header('Authorization');

    // 2. Comprovem si hi ha token a la capçalera
    if (!tokenHeader) {
        // 3. Si no hi ha token, deneguem l'accés amb error 403
        res.status(403).json({ message: 'Accés denegat: No s\'ha proporcionat token.' });
        return;
    }

    // 4. Separem el token de la capçalera (format sol ser "Bearer <token_real>")
    const tokenParts = tokenHeader.split(' ');
    
    // 5. Obtenim el token real eliminant el prefix "Bearer" si existeix
    let token;
    if (tokenParts.length === 2) {
        token = tokenParts[1];
    } else {
        token = tokenHeader;
    }

    try {
        // 6. Verifiquem la firma del token amb la clau secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // 7. Guardem les dades de l'usuari verificat a la petició
        req.user = verified;

        // 8. Deixem passar la petició al següent middleware o controlador
        next();
    } catch (error) {
        // 9. Si el token és invàlid o ha caducat, deneguem l'accés amb error 401
        res.status(401).json({ message: 'Token invàlid o expirat.' });
    }
};

module.exports = verifyToken;
