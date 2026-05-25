const express = require("express");
const router = express.Router();

const asyncHandler = require("../middlewares/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const chatMiddleware = require("../middlewares/chat.middleware");
const chatController = require("../controllers/chat.controller");

// Protect all chat routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat management APIs
 */

/**
 * @swagger
 * /api/chat/create-one-to-one/{userId}:
 *   post:
 *     summary: Create one-to-one chat
 *     description: Create or return existing private chat between two connected users
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to start chat with
 *         schema:
 *           type: string
 *         example: 6856d8a4b12c34ef56789012
 *     responses:
 *       200:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chat created successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Users are not connected
 *       500:
 *         description: Internal server error
 */
router.post(
  "/create-one-to-one/:userId",
  chatMiddleware,
  asyncHandler(chatController.createOneToOneChat)
);

/**
 * @swagger
 * /api/chat/{chatId}:
 *   get:
 *     summary: Get chat messages
 *     description: Fetch all messages of a particular chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: Chat ID
 *         schema:
 *           type: string
 *         example: 6856d8a4b12c34ef56789012
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:chatId",
  asyncHandler(chatController.getMessages)
);

module.exports = router;