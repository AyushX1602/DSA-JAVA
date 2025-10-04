const session = require("express-session");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized access" });
};

// Middleware to check if user has a specific role
// const hasRole = (roles) => {
//   return (req, res, next) => {
//     if (!req.isAuthenticated()) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//     }
//     next();
//   };
// };

const hasRole = (roles) => {
    return (req, res, next) => {
      console.log("User Role:", req.user ? req.user.role : "No user found");
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
      
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
      
      next();
    };
  };
  

// Middleware to validate session
const validateSession = (req, res, next) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).json({ message: "Invalid session, please log in again" });
  }
  next();
};

module.exports = { isAuthenticated, hasRole, validateSession };
