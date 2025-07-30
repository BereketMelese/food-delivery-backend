// models/user.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"],
  },
  phone: {
    type: String,
    required: [true, "Phone required"],
    unique: true,
    trim: true,
    match: [/^\+?\d{10,13}$/, "Invalid phone"],
  },
  password: {
    type: String,
    required: [true, "Password required"],
    minlenght: [8, "Password must be at least 8 characters"],
  },
  role: {
    type: String,
    enum: ["customer", "restaurant", "driver", "admin"],
    required: [true, "Role required"],
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: function () {
      return this.role === "driver";
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.index({ email: 1, phone: 1 });

module.exports = mongoose.model("User", UserSchema);
