const chatService = require("../services/chat.service");

// Create or get one-to-one chat
exports.createOneToOneChat = async (req, res, next) => {
//   console.log("BODY:", req.body);
// console.log("PARAMS:", req.params);
  try {
    const userId = req.user._id; // From JWT token via middleware
    const recipientId = req.params.userId;

    console.log("USER ID:", userId);
    console.log("RECIPIENT ID:", recipientId);


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

    console.log(userId, recipientId);

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