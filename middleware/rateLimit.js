const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windows: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

module.exports = limiter;
