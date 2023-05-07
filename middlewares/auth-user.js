const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { JWT_SECRET } = require("../config");
const { CustomeErrorHandler } = require("../services");

const authUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decode = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decode.id).select("-password");

      next();
    } catch (error) {
      return next(CustomeErrorHandler.unAuthorized("Invalid token"));
    }
  }

  if (!token) {
    return next(CustomeErrorHandler.unAuthorized("Token not provided"));
  }
};

module.exports = authUser;
