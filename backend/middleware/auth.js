// middleware/auth.js - Create middleware to verify JWT tokens and restrict access to certain routes.
// Apply this middleware to routes that need protection, like GET /user/:userId.

const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};
