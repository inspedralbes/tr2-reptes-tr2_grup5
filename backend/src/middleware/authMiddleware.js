const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Llegim la capçalera 'Authorization'
    const tokenHeader = req.header('Authorization');

    // Si no hi ha token, deneguem l'accés (403 Forbidden)
    if (!tokenHeader) {
        return res.status(403).json({ message: 'Accés denegat: No s\'ha proporcionat token.' });
    }

    // El format sol ser "Bearer <token_real>". Netegem el prefix si existeix.
    const tokenParts = tokenHeader.split(' ');
    const token = tokenParts.length === 2 ? tokenParts[1] : tokenHeader;

    try {
        // 2. Verifiquem la firma del token amb la nostra clau secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Si és vàlid, guardem les dades de l'usuari a la petició (req.user)
        req.user = verified;

        // 3. Deixem passar la petició al següent pas (el controlador)
        next();
    } catch (error) {
        // Si la firma no coincideix o ha caducat, deneguem l'accés (401 Unauthorized)
        res.status(401).json({ message: 'Token invàlid o expirat.' });
    }
};

module.exports = verifyToken;
