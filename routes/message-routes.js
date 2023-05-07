const express = require("express");
const { authUser } = require("../middlewares");
const router = express.Router();
const { messageControllers } = require("../controllers");

router.post("/", authUser, messageControllers.sendMessage);
router.get("/:chatId", authUser, messageControllers.allMessages);

module.exports = router;
