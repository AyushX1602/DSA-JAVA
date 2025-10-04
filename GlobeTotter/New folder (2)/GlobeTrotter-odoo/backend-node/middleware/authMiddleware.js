const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  console.log("Auth middleware - Token found:", !!token);
  console.log("Auth middleware - Cookies:", req.cookies);

  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    console.log("Auth middleware - User found:", req.user?._id);
    next();
  } catch (error) {
    console.error("Auth middleware - Token verification failed:", error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden, admin access only' });
};