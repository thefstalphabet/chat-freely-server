const express = require("express");
const router = express.Router();
const { userControllers } = require("../controllers");
const { authUser } = require("../middlewares");

router.post("/signin", userControllers.signin);
router.post("/", userControllers.register);
router.get("/", authUser, userControllers.user);
router.get("/users", authUser, userControllers.allUsers);

module.exports = router;
