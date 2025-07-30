require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { sendOTP, verifyOTP } = require("../utils/afroSms");
const { client: redisClient } = require("../config/redis");
const logger = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    const { email, phone, password, role, restaurantId } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ email, phone, password, role, restaurantId });
    await user.save();

    const { verificationID, code } = await sendOTP(phone);

    try {
      const result = await redisClient.setEx(
        `otp:${phone}`,
        300,
        JSON.stringify({ code, verificationID })
      );
      logger.info(`Redis set result: ${result}`);
    } catch (err) {
      logger.error("Redis set error:", err.message);
    }
    // await redisClient.setEx(
    //   `otp:${phone}`,
    //   300,
    //   JSON.stringify({ code, verificationId })
    // );

    res
      .status(201)
      .json({ status: "success", data: { userId: user._id, role: user.role } });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const storeData = await redisClient.get(`otp:${phone}`);
    if (!storeData) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    const { code, verificationID } = JSON.parse(storeData);
    // if (otp !== code) {
    const isvalid = await verifyOTP(phone, verificationID, otp);
    if (!isvalid) {
      return res.status(400).json({ message: "Invalid OTP" });
      // }
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { isVerified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    S;
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RefRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
    await User.updateOne({ _id: user._id }, { refreshToken });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(200)
      .json({ status: "success", data: { userId: user._id, role: user.role } });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const { verificationId, code } = await sendOTP(user.phone);
      await redisClient.setEx(
        `otp:${user.phone}`,
        300,
        JSON.stringify({ code, verificationId })
      );
      return res
        .status(403)
        .json({ message: "Please verify your phone number first." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RefRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
    await User.updateOne({ _id: user._id }, { refreshToken });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      status: "success",
      data: { userId: user._id, role: user.role },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_RefRESH_SECRET);
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user)
      return res.status(401).json({ message: "Invalid refresh token" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      status: "success",
      data: { userId: user._id, role: user.role },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Invalid refresh token" });
  }
};
