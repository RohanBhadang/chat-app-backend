const jwt = require("jsonwebtoken");
const Message = require("../models/Message.model");

module.exports = (io) => {

  
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("No token"));
     if (!socket.user?._id) {
    console.log("❌ No user in socket");
    return;
  }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      
      socket.user = {
        _id: decoded._id,
        name: decoded.name,
        email: decoded.email,
      };

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // 🔌 CONNECTION
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user._id);

    // 👇 JOIN CHAT
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user._id} joined chat ${chatId}`);
    });

    // 👇 🔥 MAIN MESSAGE LOGIC
    socket.on("send_message", async (data) => {
      try {
        console.log("🔥 EVENT HIT:", data);

        const { chatId, message } = data;

        if (!chatId || !message) {
          console.log("❌ Missing data");
          return;
        }

        console.log("Saving to DB...");
        const newMessage = await Message.create({
          chatId,
          senderId: socket.user._id,
          message,
        });

        console.log("✅ Message saved:", newMessage);

        // broadcast
        io.to(chatId).emit("receive_message", newMessage);

      } catch (err) {
        console.error("❌ Error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user._id);
    });

  });
};