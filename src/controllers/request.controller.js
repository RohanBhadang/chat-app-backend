// src/controllers/request.controller.js

const {
  sendRequestService,
  reviewRequestService,
} = require("../services/request.service");

const ConnectionRequest =
require("../models/ConnectionRequest.model.js");

// SEND CONNECTION REQUEST
const sendConnectionRequest =
async (req, res) => {

  try {

    // FIXED
    const fromUserId =
      req.user._id;

    const {
      toUserId,
      status,
    } = req.params;

    const allowedStatus = [
      "ignored",
      "interested",
    ];

    if (
      !allowedStatus.includes(status)
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid Status Type",
      });
    }

    const data =
      await sendRequestService({
        fromUserId,
        toUserId,
        status,
      });

    res.status(201).json({
      status: "success",
      message:
        "Connection Request Sent Successfully",
      data,
    });

  } catch (error) {

    console.error(
      "ERROR:",
      error
    );

    res.status(500).json({
      status: "error",
      message:
        error.message,
    });

  }

};


// REVIEW CONNECTION REQUEST
const reviewConnectionRequest =
async (req, res) => {

  try {
   console.log("loggedInUser:", req.user._id);   // 👈 ADD THIS
    console.log("requestId:", req.params.requestId); // 👈 ADD THIS
    // FIXED
    const loggedInUserId =
      req.user._id;

    const {
      requestId,
      status,
    } = req.params;

    const allowedStatus = [
      "accepted",
      "rejected",
    ];

    if (
      !allowedStatus.includes(status)
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Status Not Allowed",
      });
    }

    const data =
      await reviewRequestService({
        requestId,
        loggedInUserId,
        status,
      });

    res.status(200).json({
      status: "success",
      message:
        `Connection Request ${status}`,
      data,
    });

  } catch (error) {

    console.error(
      "ERROR:",
      error
    );

    res.status(500).json({
      status: "error",
      message:
        error.message,
    });

  }

};
const getReceivedRequests =
async (req, res) => {

  try {

    const loggedInUser =
      req.user;

    const connectionRequests =
      await ConnectionRequest.find({

        toUserId:
          loggedInUser._id,

        status:
          "interested",

      }).populate(
        "fromUserId",
        "name email"
      );

    res.status(200).json({

      success: true,

      message:
        "Requests fetched successfully",

      data:
        connectionRequests,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};
// GET CONNECTIONS
// ==============================

const getConnections =
async (req, res) => {
 console.log("ROUTE HIT");
  try {

    const loggedInUser =
      req.user;

    const connectionRequest =
      await ConnectionRequest.find({

        $or: [

          {
            toUserId:
              loggedInUser._id,

            status:
              "accepted",
          },

          {
            fromUserId:
              loggedInUser._id,

            status:
              "accepted",
          },

        ],

      })
      .populate(
  "fromUserId",
  "name email"
)
.populate(
  "toUserId",
  "name email"
);



    const data =
      connectionRequest.map((row) => {

        if (

          row.fromUserId._id
            .toString()

          ===

          loggedInUser._id
            .toString()

        ) {

          return row.toUserId;

        }

        return row.fromUserId;

      });



    res.status(200).json({

      success: true,

      message:
        "Connections fetched successfully",

      data,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};

module.exports = {
  sendConnectionRequest,
  reviewConnectionRequest,
  getReceivedRequests,
  getConnections,


};