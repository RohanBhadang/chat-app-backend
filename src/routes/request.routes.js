const express = require("express");

const requestRouter = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  sendConnectionRequest,
  reviewConnectionRequest,
  getReceivedRequests,
  getConnections,
} = require("../controllers/request.controller");

// PROTECT ALL ROUTES
requestRouter.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Connection request management APIs
 */

/**
 * @swagger
 * /api/requests/send/{status}/{toUserId}:
 *   post:
 *     summary: Send connection request
 *     description: Send a connection request to another user
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         description: Request status
 *         schema:
 *           type: string
 *           enum: [interested, ignored]
 *         example: interested
 *       - in: path
 *         name: toUserId
 *         required: true
 *         description: Target user ID
 *         schema:
 *           type: string
 *         example: 6856d8a4b12c34ef56789012
 *     responses:
 *       200:
 *         description: Connection request sent successfully
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
 *                   example: Connection request sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
requestRouter.post(
  "/send/:status/:toUserId",
  sendConnectionRequest
);

/**
 * @swagger
 * /api/requests/review/{status}/{requestId}:
 *   post:
 *     summary: Review connection request
 *     description: Accept or reject a received connection request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         description: Review status
 *         schema:
 *           type: string
 *           enum: [accepted, rejected]
 *         example: accepted
 *       - in: path
 *         name: requestId
 *         required: true
 *         description: Request ID
 *         schema:
 *           type: string
 *         example: 6856d8a4b12c34ef56789012
 *     responses:
 *       200:
 *         description: Request reviewed successfully
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
 *                   example: Request accepted successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
requestRouter.post(
  "/review/:status/:requestId",
  reviewConnectionRequest
);

/**
 * @swagger
 * /api/requests/received:
 *   get:
 *     summary: Get received connection requests
 *     description: Fetch all received pending connection requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Received requests fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
requestRouter.get(
  "/received",
  getReceivedRequests
);

/**
 * @swagger
 * /api/requests/connections:
 *   get:
 *     summary: Get all connections
 *     description: Fetch all accepted user connections
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connections fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
requestRouter.get(
  "/connections",
  getConnections
);

module.exports = requestRouter;