const {
  verifyAccessToken,
} = require("../config/jwt");

module.exports = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    // Bearer TOKEN
    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    const decoded =
      verifyAccessToken(token);

      console.log("Decoded:", decoded);


    req.user = decoded;

    next();

  } catch (err) {

    return res.status(403).json({
      status: "error",
      message:
        "Invalid or expired token",
    });

  }
};