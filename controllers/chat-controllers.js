const { Chat, User } = require("../models");
const { CustomeErrorHandler } = require("../services");
const { unKnownError } = require("../services/custome-error-handler");

const chatControllers = {
  // acess a chat or create a chat controller **********
  async accessChat(req, res, next) {
    const { userId } = req.body;

    if (!req.body) {
      console.log("userId params not send with request");
      return res.sendStatus(400);
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name avatar email",
    });

    if (isChat.length > 0) {
      res.status(200).json({ chat: isChat[0] });
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      try {
        const createdChat = await Chat.create(chatData);

        const chat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );

        res.status(200).json({ chat });
      } catch (error) {
        return next(CustomeErrorHandler.serverError());
      }
    }
  },
  // fetch all chats controller **********
  async allChats(req, res, next) {
    try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updateAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name avatar email",
          });
          res.status(200).json({ results });
        });
    } catch (error) {
      return next(CustomeErrorHandler.serverError());
    }
  },
  // create group chat controller **********
  async createGroup(req, res, next) {
    if (!req.body.users || !req.body.name) {
      return next(CustomeErrorHandler.required("All fields are required"));
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return next(
        CustomeErrorHandler.required(
          "More than 2 users are required to form a group chat"
        )
      );
    }

    users.push(req.user);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.json({ fullGroupChat });
    } catch (error) {
      return next(unKnownError(error.message));
    }
  },
  // rename group chat controller **********
  async renameGroup(req, res, next) {
    const { chatId, chatName } = req.body;

    const updateChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (updateChat) {
      res.json(updateChat);
    } else {
      return next(CustomeErrorHandler.notFound("Not found"));
    }
  },
  // add user to the existing group chat controller **********
  async addToGroup(req, res, next) {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (added) {
      res.json({ added });
    } else {
      return next(CustomeErrorHandler.notFound("Not found"));
    }
  },
  // remove user to the existing group chat controller **********
  async removeFromGroup(req, res, next) {
    const { chatId, userId } = req.body;

    const remove = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (remove) {
      res.json({ remove });
    } else {
      return next(CustomeErrorHandler.notFound("Not found"));
    }
  },
  // delete existing group chat controller **********
  async deleteGroup(req, res, next) {
    console.log(req.query.chatId);
    if (!req.query.chatId) {
      return next(CustomeErrorHandler.required("chatId required"));
    }

    try {
      const remove = await Chat.findByIdAndDelete(req.query.chatId);

      if (remove) {
        res.status(200).json({ remove });
      } else {
        return next(CustomeErrorHandler.notFound("Not found"));
      }
    } catch (error) {
      return next(unKnownError(error.message));
    }
  },
};

module.exports = chatControllers;
