const ConnectionRequest =
require("../models/ConnectionRequest.model");

exports.checkIfConnected =
async (user1, user2) => {

  const connection =
    await ConnectionRequest.findOne({

      $or: [

        {
          fromUserId: user1,
          toUserId: user2,
          status: "accepted",
        },

        {
          fromUserId: user2,
          toUserId: user1,
          status: "accepted",
        },

      ],

    });

  return !!connection;

};