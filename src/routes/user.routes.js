const express = require("express");
const router = express.Router();

const verifyJwt = require("../middlewares/auth.middleware");

const {
  getUserForFeed,
} = require("../controllers/feed.controller.js");

/**
 * @swagger
 * tags:
 *   name: Feed
 *   description: User feed related APIs
 */

// ALL USERS (OPTIONAL)
// router.get("/", verifyJwt, getAllUsers);

/**
 * @swagger
 * /api/users/feed:
 *   get:
 *     summary: Get user feed
 *     description: Fetch filtered users feed excluding existing connections and requests
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6856d8a4b12c34ef56789012
 *                       firstName:
 *                         type: string
 *                         example: Rohan
 *                       lastName:
 *                         type: string
 *                         example: Rao
 *                       email:
 *                         type: string
 *                         example: rohan@gmail.com
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/feed",
  verifyJwt,
  getUserForFeed
);

module.exports = router;