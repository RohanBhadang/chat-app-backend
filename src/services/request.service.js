const User =
require("../models/User.model");

const ConnectionRequest =
require("../models/ConnectionRequest.model");

// SEND REQUEST
exports.sendRequestService =
async ({
  fromUserId,
  toUserId,
  status,
}) => {

  const allowedStatus = [
    "ignored",
    "interested",
  ];

  if (
    !allowedStatus.includes(status)
  ) {
    throw new Error(
      "Invalid Status Type"
    );
  }

  const existingConnectionRequest =
    await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });

  if (existingConnectionRequest) {
    throw new Error(
      "Connection Already Exists"
    );
  }

  const toUser =
    await User.findById(toUserId);

  if (!toUser) {
    throw new Error(
      "User Not Found"
    );
  }

  const connectionRequest =
    new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

  return await connectionRequest.save();
};

// REVIEW REQUEST
exports.reviewRequestService =
async ({
  requestId,
  loggedInUserId,
  status,
}) => {

  const allowedStatus = [
    "accepted",
    "rejected",
  ];

  if (
    !allowedStatus.includes(status)
  ) {
    throw new Error(
      "Invalid Status"
    );
  }

  const connectionRequest =
    await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUserId,
      status: "interested",
    });

  if (!connectionRequest) {
    throw new Error(
      "Connection Request Not Found"
    );
  }

  connectionRequest.status =
    status;

  return await connectionRequest.save();
};