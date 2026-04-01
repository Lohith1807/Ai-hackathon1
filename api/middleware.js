const jwt = require('jsonwebtoken');

const authMid = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token provided' });
      
      const parts = authHeader.split(' ');
      if (parts.length !== 2) return res.status(401).json({ error: 'Token format invalid' });
      
      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
      
      req.user = decoded;
      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden. Not enough privileges.' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = authMid;
