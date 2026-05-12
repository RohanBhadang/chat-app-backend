const express =
require("express");

const requestRouter =
express.Router();

const authMiddleware =
require("../middlewares/auth.middleware");

const {
  sendConnectionRequest,
  reviewConnectionRequest,
    getReceivedRequests,
  getConnections,
} = require(
  "../controllers/request.controller"
);

// PROTECT ALL ROUTES
requestRouter.use(authMiddleware);

// SEND REQUEST
requestRouter.post(
  "/send/:status/:toUserId",
  sendConnectionRequest
);

// REVIEW REQUEST
requestRouter.post(
  "/review/:status/:requestId",
  reviewConnectionRequest
);

// GET RECEIVED REQUESTS

requestRouter.get(
  "/received",
  getReceivedRequests
);

// GET CONNECTIONS
requestRouter.get(
  "/connections",
  getConnections
);
module.exports =
requestRouter;