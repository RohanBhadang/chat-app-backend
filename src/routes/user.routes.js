const express = require("express");
const router = express.Router();

//const { getAllUsers } = require("../controllers/user.controller");
const verifyJwt = require("../middlewares/auth.middleware");
const { getUserForFeed } = require("../controllers/feed.controller.js");



// all users (simple)
// router.get("/", verifyJwt, getAllUsers);

// feed users (smart filtered)
router.get("/feed", verifyJwt, getUserForFeed);

module.exports = router;