// middleware/roleAuth.js
const roleAuth = (roles = []) => {
    // Convert string parameter to array
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      const userRole = req.user.role || 'default';
      
      if (roles.length && !roles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'You do not have permission to perform this action' 
        });
      }
      
      // User has required role, proceed
      next();
    };
  };
  
  module.exports = roleAuth;
  