const { verifyAccessToken } = require("../../config/jwt");

module.exports = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Socket authorization failed: token missing"));
  }

  try {
    const decoded = verifyAccessToken(token);

    socket.user = {
      _id: decoded._id,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(new Error("Socket authorization failed: invalid token"));
  }
};
