require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const logger = require("./utils/logger");
const authRoles = require("./routes/auth");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB and Redis
Promise.all([connectDB(), connectRedis()]).catch((err) => {
  logger.error(`Startup error: ${err.message}`);
  if (process.env.NODE_ENV !== "test")
    return process.exit(1); // Exit process with failure
  else throw err; // Rethrow error in test environment
});

// API Routes
app.use("/api/auth", authRoles);

// Error handling
app.use((err, req, res, next) => {
  logger.error("err.message");
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
