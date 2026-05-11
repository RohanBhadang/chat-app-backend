const express = require("express");
const router = express.Router();

//const { getAllUsers } = require("../controllers/user.controller");
const { getFeedUsers } = require("../controllers/feed.controller");
const verifyJwt = require("../middlewares/auth.middleware");

// all users (simple)
// router.get("/", verifyJwt, getAllUsers);

// feed users (smart filtered)
router.get("/feed", verifyJwt, getFeedUsers);

module.exports = router;