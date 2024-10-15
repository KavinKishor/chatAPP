const mongoose = require("mongoose");
const User = require("./Logschema")

const chatSchema = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupchat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timesStamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
