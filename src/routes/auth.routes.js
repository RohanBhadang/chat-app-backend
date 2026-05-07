const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refresh
} = require("../controllers/auth.controller");
const asyncHandler = require("../middlewares/asyncHandler");

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", refresh);

module.exports = router;