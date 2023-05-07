const express = require("express");
const { authUser } = require("../middlewares");
const router = express.Router();
const { chatControllers } = require("../controllers");

router.post("/", authUser, chatControllers.accessChat);
router.get("/", authUser, chatControllers.allChats);
router.post("/group", authUser, chatControllers.createGroup);
router.delete("/group", authUser, chatControllers.deleteGroup);
router.put("/rename", authUser, chatControllers.renameGroup);
router.put("/groupadd", authUser, chatControllers.addToGroup);
router.put("/groupremove", authUser, chatControllers.removeFromGroup);

module.exports = router;
