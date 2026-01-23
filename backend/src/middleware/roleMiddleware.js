const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        console.log("RUTA SOLICITADA:", req.originalUrl);
        console.log("ROL DEL USUARIO:", req.user.rol);
        // req.user ve del middleware anterior (verifyToken)
        if (!req.user || !allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'Accés denegat: No tens permisos suficients.' });
        }
        next();
    };
};

module.exports = verifyRole;
