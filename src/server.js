require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const socketHandler = require("./sockets/chat.socket");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

socketHandler(io);


server.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});