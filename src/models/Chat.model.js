const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatType: {
      type: String,
      enum: ["one-to-one", "group"],
      default: "one-to-one",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Chat || mongoose.model("Chat", chatSchema);