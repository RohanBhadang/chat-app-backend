const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat.model");
const Message = require("../models/Message.model");
const { saveMessage } = require("../services/chat.service");

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.userId);

    // Join a specific chat room
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.userId} joined chat ${chatId}`);
    });

    // Send message in a chat
    socket.on("send_message", async (data) => {
      try {
        const userId = socket.user.userId;
        const { chatId, message } = data;

        // Save message to database
        const newMessage = await saveMessage(
          chatId,
          userId,
          message
        );

        // Populate sender info
        const populatedMessage = await newMessage.populate(
          "senderId",
          "name email"
        );

        // Broadcast to chat room
        io.to(chatId).emit("receive_message", {
          _id: populatedMessage._id,
          chatId: populatedMessage.chatId,
          senderId: populatedMessage.senderId,
          message: populatedMessage.message,
          createdAt: populatedMessage.createdAt,
        });
      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.userId);
    });
  });
};