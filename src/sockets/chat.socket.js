const jwt = require("jsonwebtoken");
const Message = require("../models/Message.model");

const onlineUsers = new Map();

module.exports = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token)
      return next(new Error("No token"));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

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

  // CONNECTION
  io.on("connection", (socket) => {

    console.log(
      "User connected:",
      socket.user._id
    );

    // NEW: store online user
    onlineUsers.set(
      socket.user._id.toString(),
      socket.id
    );

    // NEW: personal room
    socket.join(
      socket.user._id.toString()
    );

    // online users emit
    io.emit(
      "online_users",
      Array.from(onlineUsers.keys())
    );

    // JOIN CHAT
    socket.on(
      "join_chat",
      (chatId) => {
        socket.join(chatId);

        console.log(
          `User ${socket.user._id} joined chat ${chatId}`
        );
      }
    );

    // SEND MESSAGE
    socket.on(
      "send_message",
      async (data) => {
        try {
          console.log(
            "🔥 EVENT HIT:",
            data
          );

          const {
            chatId,
            message,
            receiverId,   // NEW
          } = data;

          if (!chatId || !message) {
            console.log("❌ Missing data");
            return;
          }

          const newMessage =
            await Message.create({
              chatId,
              senderId:
                socket.user._id,
              message,
            });

          console.log(
            "✅ Message saved:",
            newMessage
          );

          // old logic (same)
          io.to(chatId).emit(
            "receive_message",
            newMessage
          );

          // NEW notification
          if (receiverId) {
            io.to(receiverId).emit(
              "new_notification",
              {
                senderId:
                  socket.user._id,
                senderName:
                  socket.user.name,
                message,
                chatId,
              }
            );

            console.log(
              "✅ notification sent"
            );
          }

        } catch (err) {
          console.error(
            "❌ Error:",
            err
          );
        }
      }
    );

    socket.on(
      "disconnect",
      () => {

        onlineUsers.delete(
          socket.user._id.toString()
        );

        io.emit(
          "online_users",
          Array.from(
            onlineUsers.keys()
          )
        );

        console.log(
          "User disconnected:",
          socket.user._id
        );
      }
    );
  });
};