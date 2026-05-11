const bcrypt = require("bcrypt");

const User =
require("../models/User.model");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../config/jwt");

// REGISTER
exports.registerUser =
async (name, email, password) => {

  const existingUser =
    await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      "User already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user =
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

  return {
    message:
      "User registered successfully",
    user,
    accessToken,
    refreshToken,
  };
};

// LOGIN
exports.loginUser =
async (email, password) => {

  const user =
    await User.findOne({ email });

  if (!user) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const isMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isMatch) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

  return {
    message:
      "Login successful",
    user,
    accessToken,
    refreshToken,
  };
};

// REFRESH TOKEN
exports.refreshAccessToken =
async (token) => {

  if (!token) {
    throw new Error(
      "Refresh token required"
    );
  }

  const decoded =
    verifyRefreshToken(token);

  const user =
    await User.findById(
      decoded._id
    );

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  const newAccessToken =
    generateAccessToken(user);

  return newAccessToken;
};