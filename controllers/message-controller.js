const { CustomeErrorHandler } = require("../services");
const { Message, User, Chat } = require("../models");

const messageControllers = {
  async sendMessage(req, res, next) {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      next(CustomeErrorHandler.required("Invalid data passsedn into request"));
    }

    var newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    try {
      var message = await Message.create(newMessage);

      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });

      res.status(200).json({ message });
    } catch (error) {
      next(CustomeErrorHandler.unKnownError(error.message));
    }
  },
  async allMessages(req, res, next) {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name avatar email")
        .populate("chat");

      res.status(200).json({ messages });
    } catch (error) {
      next(CustomeErrorHandler.unKnownError(error.message));
    }
  },
};

module.exports = messageControllers;
