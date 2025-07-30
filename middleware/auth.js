const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "Unauthorized: Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    logger.error(`Auth error: ${err.message}`);
    res.status(401).json({ message: "Unauthorized: Token error" });
  }
};

module.exports = authenticate;
