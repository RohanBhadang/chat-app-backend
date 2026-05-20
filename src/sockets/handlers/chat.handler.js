const Message = require("../../models/Message.model");
const { sendSocketError } = require("../../utils/socketResponse");

module.exports = (socket, socketManager) => {
  socket.on("join_chat", (chatId) => {
    if (!chatId) {
      return sendSocketError(socket, "chatId is required to join a chat room.");
    }

    socket.join(chatId);
    console.log(`User ${socket.user._id} joined chat ${chatId}`);
  });

  socket.on("send_message", async (data, ack) => {
    try {
      const { chatId, message, receiverId } = data || {};

      if (!chatId || !message) {
        return sendSocketError(socket, "Missing chatId or message payload.", "INVALID_PAYLOAD", ack);
      }

      const newMessage = await Message.create({
        chatId,
        senderId: socket.user._id,
        message,
      });

      socketManager.io.to(chatId).emit("receive_message", newMessage);

      if (receiverId) {
        socketManager.sendToUser(receiverId, "new_notification", {
          senderId: socket.user._id,
          senderName: socket.user.name,
          message,
          chatId,
        });
      }

      if (typeof ack === "function") {
        ack({ status: "success", data: newMessage });
      }
    } catch (error) {
      console.error("Chat event error:", error);
      sendSocketError(socket, "Failed to send message.", "SEND_MESSAGE_FAILED", ack);
    }
  });
};
