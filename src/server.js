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
io.on("connection",(socket)=>{
  console.log("CONNECTED:", socket.id);

  socket.on("disconnect",(reason)=>{
    console.log("DISCONNECTED:", socket.id, reason);
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});