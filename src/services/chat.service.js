const Chat = require("../models/Chat.model");
const Message = require("../models/Message.model");

// Create or get one-to-one chat
exports.getOrCreateOneToOneChat = async (userId1, userId2) => {
  // Check if chat already exists between these two users
  let chat = await Chat.findOne({
    chatType: "one-to-one",
    participants: {
      $all: [userId1, userId2],
    },
  });

  // If not, create new chat
  if (!chat) {
    chat = await Chat.create({
      participants: [userId1, userId2],
      chatType: "one-to-one",
    });
  }

  return chat;
};

// Save message
exports.saveMessage = async (chatId, senderId, message) => {
  const newMessage = await Message.create({
    chatId,
    senderId,
    message,
  });

  // Update chat's lastMessage
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: newMessage._id,
  });

  return newMessage;
};

// Get messages for a chat
exports.getMessages = async (chatId) => {
  const messages = await Message.find({ chatId })
    .populate("senderId", "name email")
    .sort({ createdAt: 1 });
  return messages;
};