const chatService = require("../services/chat.service");

// Create or get one-to-one chat
exports.createOneToOneChat = async (req, res, next) => {
  try {
    const userId = req.user.userId; // From JWT token via middleware
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required",
      });
    }

    if (userId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create chat with yourself",
      });
    }

    const chat = await chatService.getOrCreateOneToOneChat(
      userId,
      recipientId
    );

    res.json({
      success: true,
      chatId: chat._id,
      data: chat,
    });
  } catch (err) {
    next(err);
  }
};

// Get messages for a chat
exports.getMessages = async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await chatService.getMessages(chatId);

  res.json({
    success: true,
    data: messages,
  });
};