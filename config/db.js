const mongoose = require("mongoose");
const logger = require("../utils/logger");
const e = require("express");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB Atlas connected successfully");
  } catch (err) {
    logger.error(`MongoDB Atlas connection error: ${err.message}`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1); // Exit process with failure
    } else {
      throw err; // Rethrow error in test environment
    }
  }
};

module.exports = connectDB;
