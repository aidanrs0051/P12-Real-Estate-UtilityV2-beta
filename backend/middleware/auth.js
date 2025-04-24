// In middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header OR query parameter
  const token = req.header('x-auth-token') || req.query.token;
  
  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
