// src/controllers/request.controller.js

const {
  sendRequestService,
  reviewRequestService,
} = require("../services/request.service");


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


module.exports = {
  sendConnectionRequest,
  reviewConnectionRequest,
};