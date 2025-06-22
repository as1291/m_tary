// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';

/**
 * Verifies JWT and attaches user info to req.user
 */
module.exports = function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Missing token.' });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (requiredRoles.length && !requiredRoles.includes(payload.role))
        return res.status(403).json({ message: 'Insufficient privileges.' });

      req.user = payload;        // { uid, role, base }
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};
