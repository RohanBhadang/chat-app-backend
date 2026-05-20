const User = require("../models/User.model.js");
const ConnectionRequest = require("../models/ConnectionRequest.model.js");
const AppError = require("../utils/AppError");


const getFeedUsers = async (currentUserId) => {
  try {
  
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: currentUserId },
        { toUserId: currentUserId },
      ],
    }).select("fromUserId toUserId");

    // 🔥 STEP 2: build exclusion list
    const excludedUsers = new Set();

    connections.forEach((c) => {
      if (c?.fromUserId) excludedUsers.add(c.fromUserId.toString());
      if (c?.toUserId) excludedUsers.add(c.toUserId.toString());
    });

    // 🔥 STEP 3: always exclude self
    excludedUsers.add(currentUserId.toString());

    // 🔥 STEP 4: fetch clean feed
    const users = await User.find({
      _id: { $nin: Array.from(excludedUsers) },
    }).select("-password -refreshToken");

    return users;

  } catch (error) {
    console.log("FEED ERROR:", error);
    throw new AppError(error.message, 500);
  }
};

module.exports = { getFeedUsers };