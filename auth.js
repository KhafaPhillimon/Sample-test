/**
 * JWT Authentication Middleware
 * Checks the Authorization header, verifies the token, and attaches req.user.
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bocra_portal_secret_key_2026';

module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, name }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }
};
