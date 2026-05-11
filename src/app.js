const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");
const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const requestRoutes =require("./routes/request.routes");
const app = express();
console.log("Auth routes loaded");
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);
console.log("Auth routes loaded");
module.exports = app;