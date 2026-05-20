const express = require("express");
const router = express.Router();

const asyncHandler = require("../middlewares/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const chatMiddleware = require("../middlewares/chat.middleware"); 
const chatController = require("../controllers/chat.controller");

// Protect all chat routes
router.use(authMiddleware);

// 🔥 CREATE CHAT (ONLY IF CONNECTED)
router.post(
  "/create-one-to-one/:userId",
  chatMiddleware,
  asyncHandler(chatController.createOneToOneChat)
);

// GET MESSAGES (optional: also secure it if needed)
router.get(
  "/:chatId",
  asyncHandler(chatController.getMessages)
);

module.exports = router;