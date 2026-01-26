// ======================================
// Importem les dependències
// ======================================

// No calen dependències externes

// ======================================
// Definició de l'Esquema
// ======================================

// Middleware de verificació de rols: Comprova si l'usuari té el rol necessari per accedir

// ======================================
// Declaracions de funcions
// ======================================

const roleMiddleware = {};

// A) --- Verificar que l'usuari té un dels rols permesos ---
roleMiddleware.verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        // 1. Comprovem si existeix l'usuari a la petició (prové del middleware verifyToken)
        if (!req.user) {
            // 2. Si no hi ha usuari, deneguem l'accés amb error 403
            res.status(403).json({ message: 'Accés denegat: No tens permisos suficients.' });
            return;
        }

        // 3. Obtenim el rol de l'usuari
        const userRol = req.user.rol;

        // 4. Comprovem si el rol de l'usuari està dins dels rols permesos utilitzant un bucle
        let rolPermes = false;
        for (let i = 0; i < allowedRoles.length; i++) {
            if (allowedRoles[i] === userRol) {
                rolPermes = true;
                break;
            }
        }

        // 5. Si el rol no està permès, deneguem l'accés
        if (!rolPermes) {
            res.status(403).json({ message: 'Accés denegat: No tens permisos suficients.' });
            return;
        }

        // 6. Si tot és correcte, deixem passar la petició al següent middleware o controlador
        next();
    };
};

module.exports = roleMiddleware.verifyRole;
