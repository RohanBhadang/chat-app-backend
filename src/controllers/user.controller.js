const User = require("../models/user.model");

const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: currentUserId }, // 👈 khud ko hatao
    }).select("-password -refreshToken");

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

module.exports = { getAllUsers };