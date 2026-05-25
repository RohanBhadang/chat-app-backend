const asyncHandler = require("../middlewares/asyncHandler.js");
const {getFeedUsers} = require("../services/feed.service.js");


const getUserForFeed = asyncHandler(async (req, res) => {
console.log("🔥 FEED API HIT");
     console.log("REQ USER:", req.user);
    const userId = req.user._id;
    const response = await getFeedUsers(userId);
    return res.status(200).json({
        status: "success",
        data: response,
    });
});

module.exports = { getUserForFeed };