const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_de_desarrollo";

function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ mensaje: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const verificado = jwt.verify(token, JWT_SECRET);
        req.usuario = verificado; // Adjuntamos los datos desencriptados del usuario (id, nombre, email, rol)
        next();
    } catch (error) {
        res.status(403).json({ mensaje: "Token inválido o expirado." });
    }
}

function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: "Acceso denegado. Permisos insuficientes para esta acción." });
        }
        next();
    };
}

module.exports = { verificarToken, verificarRol };
