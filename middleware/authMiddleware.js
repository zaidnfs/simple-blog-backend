const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = verified; // Attach user data to request
    next(); // Move to next middleware
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
