const express = require("express");
const router = express.Router();

const asyncHandler = require("../middlewares/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

// Protect all chat routes with auth middleware
router.use(authMiddleware);


router.post("/create-one-to-one", asyncHandler(chatController.createOneToOneChat));
router.get("/:chatId", asyncHandler(chatController.getMessages));

module.exports = router;