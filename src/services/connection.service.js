const { checkIfConnected } = require("../services/connection.service");

module.exports = async (req, res, next) => {

  const user1 = req.user._id;
  const user2 = req.params.userId; // chat partner

  const isConnected = await checkIfConnected(user1, user2);

  if (!isConnected) {
    return res.status(403).json({
      status: "error",
      message: "You are not connected, chat not allowed",
    });
  }

  next();
};