const { User } = require("../models");
const { generateToken } = require("../services");
const bcrypt = require("bcryptjs");
const { CustomeErrorHandler } = require("../services");

const userControllers = {
  // register users controller **********
  async register(req, res, next) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(CustomeErrorHandler.required("All fields are required"));
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return next(CustomeErrorHandler.exists("Email already registered"));
    }

    // encrypting password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({ token: generateToken(user._id) });
    } else {
      return next(CustomeErrorHandler.serverError());
    }
  },
  // signin users controller **********
  async signin(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(CustomeErrorHandler.required("All fields are required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(CustomeErrorHandler.notRegistred("Email not registered yet"));
    }

    const comparingPassword = await bcrypt.compare(password, user.password);

    if (comparingPassword) {
      res.status(201).json({
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token: generateToken(user._id),
      });
    } else {
      return next(CustomeErrorHandler.unAuthorized("Invalid email & password"));
    }
  },
  // get user credentials controller **********
  async user(req, res, next) {
    const user = req.user;
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  },
  // all users controller **********
  async allUsers(req, res, next) {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  },
};

module.exports = userControllers;
