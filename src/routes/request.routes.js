const express =
require("express");

const requestRouter =
express.Router();

const authMiddleware =
require("../middlewares/auth.middleware");

const {
  sendConnectionRequest,
  reviewConnectionRequest,
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

module.exports =
requestRouter;