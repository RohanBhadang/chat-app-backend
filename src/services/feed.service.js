const User = require("../models/User.model");
const ConnectionRequest = require("../models/ConnectionRequest.model");

const getFeedUsersService = async (loggedInUser, page, limit) => {

  const skip = (page - 1) * limit;

  const connectionRequests = await ConnectionRequest.find({
    $or: [
      { fromUserId: loggedInUser._id },
      { toUserId: loggedInUser._id },
    ],
  }).select("fromUserId toUserId");

  const hideUsers = new Set();

  connectionRequests.forEach((r) => {
    if (r?.fromUserId) hideUsers.add(r.fromUserId.toString());
    if (r?.toUserId) hideUsers.add(r.toUserId.toString());
  });

  hideUsers.add(loggedInUser._id.toString());

  const users = await User.find({
    _id: { $nin: Array.from(hideUsers) },
  })
    .select("firstName lastName photoUrl about")
    .skip(skip)
    .limit(limit);

  return users;
};


module.exports = {
  getFeedUsersService,
};