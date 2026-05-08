const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/user.controller");
const verifyJwt = require("../middlewares/auth.middleware");

router.get("/", verifyJwt, getAllUsers);

module.exports = router;