const User = require("../models/User.model");
const ConnectionRequest = require("../models/ConnectionRequest.model");

const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const requests = await ConnectionRequest.find({
      $or: [
        { fromUserId: currentUserId },
        { toUserId: currentUserId },
      ],
    }).select("fromUserId toUserId");

    const hideUsers = new Set();

    for (const r of requests) {
      // 🔥 SAFE CHECK (no crash ever)
      const from = r?.fromUserId;
      const to = r?.toUserId;

      if (from) hideUsers.add(from.toString());
      if (to) hideUsers.add(to.toString());
    }

    hideUsers.add(currentUserId.toString());

    const users = await User.find({
      _id: { $nin: Array.from(hideUsers) },
    }).select("-password -refreshToken");

    res.json({
      success: true,
      data: users,
    });

  } catch (err) {
    console.log("GET USERS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

module.exports = { getAllUsers }; 