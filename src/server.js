require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const socketHandler = require("./sockets/chat.socket");

connectDB();

const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || process.env.CORS_ORIGIN || "*";
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
