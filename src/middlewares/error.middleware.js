module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  console.log("ERROR:", err);

  res.status(err.statusCode).json({
    status: "error",
    message: err.message,
  });
};