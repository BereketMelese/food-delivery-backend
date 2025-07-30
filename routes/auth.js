const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email formate"),
    body("phone")
      .matches(/^\+?\d{10,13}$/)
      .withMessage("Invalid phone number"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("role")
      .isIn(["customer", "restaurant", "driver", "admin"])
      .withMessage("Invalid role"),
  ],
  authController.register
);

router.post(
  "/verify-otp",
  [
    body("phone")
      .matches(/^\+?\d{10,13}$/)
      .withMessage("Invalid phone number"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Invlaid OTP"),
  ],
  authController.verifyOtp
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  authController.login
);

router.post("/refresh-token", authController.refreshToken);

module.exports = router;
